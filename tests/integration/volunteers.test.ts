import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { betterAuth } from "better-auth";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { createDatabaseClient } from "../../src/server/database/client";
import { readDatabaseUrl } from "../../src/server/database/environment";
import { verifyTarget } from "../../scripts/database-target";
import { createAuth } from "../../src/server/auth/factory";
import { getVolunteerEditor, saveVolunteer } from "../../src/server/volunteers/service";
import { saveVolunteerAction } from "../../src/app/admin/(protected)/volunteers/actions";
import { DEFAULT_TIME_ZONE, type VolunteerInput } from "../../src/server/volunteers/validation";
import { VolunteerEditor } from "../../src/components/admin/VolunteerEditor";
import { renderToStaticMarkup } from "react-dom/server";
import type { Prisma } from "../../src/generated/prisma/client";

let pageHeaders = new Headers();
vi.mock("next/headers", () => ({ headers: async () => pageHeaders }));
vi.mock("../../src/server/db", () => ({ getDatabase: () => db }));
vi.mock("../../src/server/auth/index", () => ({ getAuth: () => auth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }), notFound: () => { throw new Error("NOT_FOUND"); }, redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
const prefix = `volunteer-test-${randomUUID()}`;
const env = { BETTER_AUTH_URL: "http://localhost:3000", BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"), NODE_ENV: "test" };
let db: ReturnType<typeof createDatabaseClient>;
let auth: ReturnType<typeof createAuth>;
const sessions: Record<string, Headers> = {};
const roleIds = [randomUUID(), randomUUID()];
const profileIds: string[] = [];
let current: VolunteerInput;

function input(): VolunteerInput {
  const id = randomUUID(); profileIds.push(id);
  return { id, updatedAt: "", displayName: `${prefix} volunteer`, email: `${prefix}@example.invalid`, status: "ACTIVE", roleIds: [], availability: [], foodHandlerIssuedOn: "", foodHandlerExpiresOn: "" };
}
const window = (start = "09:00", end = "12:00") => ({ id: randomUUID(), dayOfWeek: 1, start, end, timeZone: DEFAULT_TIME_ZONE, validFrom: "2026-11-09", validUntil: "" });
async function fresh(value: VolunteerInput) {
  const data = await getVolunteerEditor(value.id);
  return { ...value, updatedAt: data!.volunteer!.updatedAt.toISOString() };
}

beforeAll(async () => {
  const url = readDatabaseUrl(process.env, "TEST_DATABASE_URL");
  await verifyTarget(url, "test");
  const migration = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy", "--config", "prisma.config.ts"], { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" });
  if (migration.status !== 0) throw new Error("Volunteer test migration failed; no reset attempted.");
  db = createDatabaseClient(url);
  auth = createAuth(db, env);
  const fixtures = betterAuth({ ...auth.options, emailAndPassword: { ...auth.options.emailAndPassword, enabled: true, disableSignUp: false, autoSignIn: false } });
  for (const role of ["ADMIN", "COORDINATOR", "VIEWER"] as const) {
    const password = randomBytes(24).toString("base64url");
    const email = `${prefix}-${role.toLowerCase()}@example.invalid`;
    const { user } = await fixtures.api.signUpEmail({ body: { email, password, name: prefix } });
    await db.user.update({ where: { id: user.id }, data: { role } });
    const response = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
    const cookie = response.headers.getSetCookie().find(value => value.startsWith("better-auth.session_token="))!.split(";")[0];
    sessions[role] = new Headers({ cookie });
  }
  await db.volunteerRole.createMany({ data: roleIds.map((id, i) => ({ id, name: `${prefix} role ${i}` })) });
});
afterAll(async () => {
  if (!db) return;
  await db.shiftAssignment.deleteMany({ where: { volunteerId: { in: profileIds } } });
  await db.shift.deleteMany({ where: { definition: { name: prefix } } });
  await db.shiftDefinition.deleteMany({ where: { name: prefix } });
  await db.availability.deleteMany({ where: { volunteerId: { in: profileIds } } });
  await db.volunteerRoleMembership.deleteMany({ where: { volunteerId: { in: profileIds } } });
  await db.volunteerProfile.deleteMany({ where: { id: { in: profileIds } } });
  await db.volunteerRole.deleteMany({ where: { id: { in: roleIds } } });
  await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
  await db.$disconnect();
});

it("rejects missing sessions and VIEWER direct service/action writes before validation", async () => {
  for (const headers of [new Headers(), sessions.VIEWER]) {
    pageHeaders = headers;
    for (const mode of ["create", "update"] as const) {
      const result = await saveVolunteer(mode, { role: "ADMIN" });
      expect(result).toMatchObject({ ok: false, error: expect.stringMatching(/sign in|permission/) });
      expect(await saveVolunteerAction(mode, input())).toMatchObject({ ok: false });
    }
  }
  pageHeaders = new Headers();
  await expect(getVolunteerEditor()).rejects.toMatchObject({ status: 401 });
});
it("creates profiles without accounts as ADMIN, and rejects repeated creation", async () => {
  pageHeaders = sessions.ADMIN;
  current = { ...input(), roleIds, availability: [window(), window("14:00", "17:00")] };
  expect(await saveVolunteerAction("create", current)).toEqual({ ok: true, id: current.id });
  const row = await db.volunteerProfile.findUniqueOrThrow({ where: { id: current.id }, include: { roles: true, availability: true } });
  expect(row.userId).toBeNull(); expect(row.roles).toHaveLength(2); expect(row.availability).toHaveLength(2);
  expect(row.foodHandlerExpiresOn).toBeNull();
  expect(await saveVolunteer("create", current)).toMatchObject({ ok: false });
  expect(await db.volunteerProfile.count({ where: { id: current.id } })).toBe(1);
});
it("lets COORDINATOR edit profiles, remove roles and windows, and preserves assignment history when inactive", async () => {
  pageHeaders = sessions.COORDINATOR;
  const definition = await db.shiftDefinition.create({ data: { name: prefix, roleId: roleIds[0] } });
  const shift = await db.shift.create({ data: { definitionId: definition.id, startsAt: new Date("2026-11-09T16:00:00Z"), endsAt: new Date("2026-11-09T18:00:00Z"), capacity: 2 } });
  const assignment = await db.shiftAssignment.create({ data: { shiftId: shift.id, volunteerId: current.id, status: "COMPLETED" } });
  current = { ...await fresh(current), displayName: `${prefix} edited`, email: "", status: "INACTIVE", roleIds: [roleIds[1]], availability: [{ ...current.availability[1], start: "13:00", end: "24:00", validUntil: "2026-12-31" }], foodHandlerIssuedOn: "2026-01-01", foodHandlerExpiresOn: "2027-01-01" };
  expect(await saveVolunteer("update", current)).toMatchObject({ ok: true });
  const row = (await getVolunteerEditor(current.id))!.volunteer!;
  expect(row.status).toBe("INACTIVE"); expect(row.email).toBeNull(); expect(row.roles.map(role => role.roleId)).toEqual([roleIds[1]]);
  expect(row.availability).toHaveLength(1); expect(row.availability[0].startMinute).toBe(780); expect(row.availability[0].endMinute).toBe(1440);
  expect(row.foodHandlerIssuedOn?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  expect(await db.shiftAssignment.findUnique({ where: { id: assignment.id } })).toEqual(assignment);
  expect(await saveVolunteer("update", current)).toMatchObject({ ok: false, error: expect.stringContaining("changed") });
  current = { ...await fresh(current), status: "ACTIVE", roleIds: [], availability: [], foodHandlerIssuedOn: "", foodHandlerExpiresOn: "" };
  expect(await saveVolunteer("update", current)).toMatchObject({ ok: true });
  expect((await getVolunteerEditor(current.id))!.volunteer!.availability).toEqual([]);
});
it("allows coordinator creation and idempotent relationship saves without duplicates", async () => {
  pageHeaders = sessions.COORDINATOR;
  const value = { ...input(), roleIds, availability: [window()] };
  expect(await saveVolunteer("create", value)).toMatchObject({ ok: true });
  expect(await saveVolunteer("update", await fresh(value))).toMatchObject({ ok: true });
  expect(await db.volunteerRoleMembership.count({ where: { volunteerId: value.id } })).toBe(2);
  expect(await db.availability.count({ where: { volunteerId: value.id } })).toBe(1);
});
it("returns validation errors without writing invalid names, email, dates, status, role IDs, or windows", async () => {
  pageHeaders = sessions.ADMIN;
  const invalid = [
    { displayName: "  " }, { email: "invalid" }, { status: "ADMIN" }, { roleIds: ["bad-id"] }, { roleIds: [roleIds[0], roleIds[0]] },
    { foodHandlerIssuedOn: "2026-02-30" }, { foodHandlerIssuedOn: "2026-02-01", foodHandlerExpiresOn: "2026-01-01" },
    { availability: [{ ...window(), dayOfWeek: 7 }] }, { availability: [window("12:00", "09:00")] },
    { availability: [{ ...window(), validUntil: "2026-01-01" }] }, { availability: [{ ...window(), timeZone: "Invalid/Zone" }] },
    { availability: [window(), window("10:00", "13:00")] },
  ];
  for (const fields of invalid) {
    const value = { ...input(), ...fields };
    expect(await saveVolunteer("create", value)).toMatchObject({ ok: false, issues: expect.any(Array) });
    expect(await db.volunteerProfile.findUnique({ where: { id: value.id } })).toBeNull();
  }
});
it("allows adjacent windows and overlapping clock times with disjoint effective dates", async () => {
  pageHeaders = sessions.ADMIN;
  const value = { ...input(), availability: [window(), window("12:00", "14:00"), { ...window(), validFrom: "2027-01-01" }] };
  value.availability[0].validUntil = "2026-12-31";
  expect(await saveVolunteer("create", value)).toMatchObject({ ok: true });
});
it("handles nonexistent/malformed IDs, invalid roles, and cross-volunteer window ownership atomically", async () => {
  pageHeaders = sessions.ADMIN;
  expect(await getVolunteerEditor("bad-id")).toBeNull();
  expect(await getVolunteerEditor(randomUUID())).toBeNull();
  expect(await saveVolunteer("update", { ...input(), updatedAt: new Date().toISOString() })).toMatchObject({ ok: false });
  const before = await db.volunteerProfile.findUniqueOrThrow({ where: { id: current.id } });
  expect(await saveVolunteer("update", { ...await fresh(current), displayName: "Should roll back", roleIds: [randomUUID()] })).toMatchObject({ ok: false });
  expect(await db.volunteerProfile.findUnique({ where: { id: current.id } })).toEqual(before);
  const other = await db.availability.findFirstOrThrow({ where: { volunteerId: { in: profileIds }, NOT: { volunteerId: current.id } } });
  expect(await saveVolunteer("update", { ...await fresh(current), displayName: "Should also roll back", availability: [{ ...window(), id: other.id }] })).toMatchObject({ ok: false });
  expect(await db.volunteerProfile.findUnique({ where: { id: current.id } })).toEqual(before);
});
it("rolls back real SQL writes on database failure and returns a sanitized error", async () => {
  pageHeaders = sessions.ADMIN;
  const before = await db.volunteerProfile.findUniqueOrThrow({ where: { id: current.id } });
  const original = db.$transaction.bind(db);
  // Execute the normal mutation in a real transaction, then force a PostgreSQL failure before commit.
  const failure = vi.spyOn(db, "$transaction").mockImplementationOnce(((callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => original(async tx => {
    await callback(tx);
    await tx.$executeRawUnsafe("SELECT 1 / 0");
  })) as typeof db.$transaction);
  try {
    const result = await saveVolunteer("update", { ...await fresh(current), displayName: "Must not persist", roleIds });
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("Unable to save") });
    expect(JSON.stringify(result)).not.toMatch(/division|SELECT|Prisma/);
    expect(await db.volunteerProfile.findUnique({ where: { id: current.id } })).toEqual(before);
    expect(await db.volunteerRoleMembership.count({ where: { volunteerId: current.id } })).toBe(0);
  } finally { failure.mockRestore(); }
});
it("renders viewer details without mutation controls and rejects viewer creation pages", async () => {
  pageHeaders = sessions.VIEWER;
  const editor = (await getVolunteerEditor(current.id))!;
  expect(editor.canWrite).toBe(false);
  // Resolve the server editor; the form renders normally under React's server renderer.
  const html = renderToStaticMarkup(await VolunteerEditor({ id: current.id }));
  expect(html).toContain("Read-only access"); expect(html).toContain("disabled");
  expect(html).not.toContain("Save changes"); expect(html).not.toContain("Add Monday window");
  expect(renderToStaticMarkup(await VolunteerEditor({}))).toContain("do not have permission");
});
it("rejects simultaneous stale edits and prevents cross-volunteer availability ID collisions", async () => {
  pageHeaders = sessions.ADMIN;
  const value = input();
  expect(await saveVolunteer("create", value)).toMatchObject({ ok: true });
  const version = await fresh(value);
  const edits = await Promise.all(["First", "Second"].map(displayName => saveVolunteer("update", { ...version, displayName })));
  expect(edits.filter(result => result.ok)).toHaveLength(1);
  expect(edits.filter(result => !result.ok)).toHaveLength(1);
  const shared = window();
  const left = { ...input(), availability: [shared] };
  const right = { ...input(), availability: [{ ...shared, start: "10:00" }] };
  const attempts = await Promise.all([left, right].map(profile => saveVolunteer("create", profile)));
  expect(attempts.filter(result => result.ok)).toHaveLength(1);
  const winner = attempts[0].ok ? left : right;
  const row = await db.availability.findUniqueOrThrow({ where: { id: shared.id } });
  expect(row.volunteerId).toBe(winner.id);
  expect(row.startMinute).toBe(winner === left ? 540 : 600);
  expect(await db.volunteerProfile.count({ where: { id: { in: [left.id, right.id] } } })).toBe(1);
});
