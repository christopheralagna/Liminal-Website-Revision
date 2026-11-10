import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { Client } from "pg";
import { betterAuth } from "better-auth";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createDatabaseClient } from "../../src/server/database/client";
import { readDatabaseUrl } from "../../src/server/database/environment";
import { verifyTarget } from "../../scripts/database-target";
import { createAuth } from "../../src/server/auth/factory";
import { getSchedule, getShift, getPattern, getPatterns, getSchedulingCatalog, getShiftTypes, getShiftType, getSchedulingFilters, mutateScheduling, type SchedulingCommand } from "../../src/server/scheduling/service";
import { schedulingAction } from "../../src/app/admin/(protected)/scheduling/actions";
import ShiftPage from "../../src/app/admin/(protected)/scheduling/[id]/page";
import SchedulingPage from "../../src/app/admin/(protected)/scheduling/page";
import PatternPage from "../../src/app/admin/(protected)/scheduling/patterns/[id]/page";
import ShiftTypePage from "../../src/app/admin/(protected)/scheduling/types/[id]/page";
import ShiftTypesPage from "../../src/app/admin/(protected)/scheduling/types/page";
import NewShiftTypePage from "../../src/app/admin/(protected)/scheduling/types/new/page";
import NewShiftPage from "../../src/app/admin/(protected)/scheduling/new/page";
import { addDays, dateOnly, dateValue, localInstant, phoenixDate } from "../../src/server/scheduling/dates";
import type { Prisma } from "../../src/generated/prisma/client";

let pageHeaders = new Headers();
vi.mock("next/headers", () => ({ headers: async () => pageHeaders }));
vi.mock("../../src/server/db", () => ({ getDatabase: () => db }));
vi.mock("../../src/server/auth/index", () => ({ getAuth: () => auth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ RedirectType: { replace: "replace" }, unstable_rethrow: () => {}, useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }), notFound: () => { throw new Error("NOT_FOUND"); }, redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
let db: ReturnType<typeof createDatabaseClient>;
let auth: ReturnType<typeof createAuth>;
const prefix = `scheduling-test-${randomUUID()}`;
const sessions: Record<string, Headers> = {};
const roleId = randomUUID(), definitionId = randomUUID(), volunteerId = randomUUID();
const definitions: string[] = [definitionId];
const future = addDays(phoenixDate(), 40);
const shiftInput = () => ({ id: randomUUID(), definitionId, roleId, date: future, start: "09:00", endDate: future, end: "12:00", capacity: 2 });
const patternInput = () => ({ id: randomUUID(), definitionId, roleId, dayOfWeek: 1, start: "09:00", durationMinutes: 180, capacity: 3, validFrom: future, validUntil: "" });
const versionOf = (row: { id: string; updatedAt: Date }) => ({ id: row.id, updatedAt: row.updatedAt.toISOString() });
async function shifts(patternId: string) { return db.shift.findMany({ where: { patternId }, orderBy: { occurrenceDate: "asc" } }); }
async function newPattern() {
  const input = patternInput();
  expect(await mutateScheduling("createPattern", input)).toMatchObject({ ok: true, id: input.id, message: expect.stringContaining("Created 8") });
  return (await getPattern(input.id))!.pattern;
}
beforeAll(async () => {
  const url = readDatabaseUrl(process.env, "TEST_DATABASE_URL");
  await verifyTarget(url, "test");
  const migration = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy", "--config", "prisma.config.ts"], { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" });
  if (migration.status !== 0) throw new Error("Scheduling test migration failed; no reset attempted.");
  db = createDatabaseClient(url);
  const env = { BETTER_AUTH_URL: "http://localhost:3000", BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"), NODE_ENV: "test" };
  auth = createAuth(db, env);
  const fixtures = betterAuth({ ...auth.options, emailAndPassword: { ...auth.options.emailAndPassword, enabled: true, disableSignUp: false, autoSignIn: false } });
  for (const role of ["ADMIN", "COORDINATOR", "VIEWER"] as const) {
    const password = randomBytes(24).toString("base64url"), email = `${prefix}-${role.toLowerCase()}@example.invalid`;
    const { user } = await fixtures.api.signUpEmail({ body: { email, password, name: prefix } });
    await db.user.update({ where: { id: user.id }, data: { role } });
    const response = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
    sessions[role] = new Headers({ cookie: response.headers.getSetCookie().find(value => value.startsWith("better-auth.session_token="))!.split(";")[0] });
  }
  await db.volunteerRole.create({ data: { id: roleId, name: prefix } });
  await db.shiftDefinition.create({ data: { id: definitionId, name: prefix, roleId } });
  await db.volunteerProfile.create({ data: { id: volunteerId, displayName: prefix } });
  pageHeaders = sessions.ADMIN;
});
afterAll(async () => {
  if (!db) return;
  await db.shiftAssignment.deleteMany({ where: { volunteerId } });
  await db.shift.deleteMany({ where: { definitionId: { in: definitions } } });
  await db.shiftPattern.deleteMany({ where: { definitionId: { in: definitions } } });
  await db.shiftDefinition.deleteMany({ where: { id: { in: definitions } } });
  await db.volunteerRole.deleteMany({ where: { id: roleId } });
  await db.volunteerProfile.deleteMany({ where: { id: volunteerId } });
  await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
  await db.$disconnect();
});

it("protects every read and mutation independently for live sessions and roles", async () => {
  const commands: SchedulingCommand[] = ["definition", "createShift", "editShift", "cancelShift", "createPattern", "generate", "endPattern", "revisePattern", "extendPattern", "shortenPattern", "cancelPattern", "updateDefinition", "deleteDefinition"];
  pageHeaders = new Headers();
  for (const read of [() => getSchedule(future, addDays(future, 55)), getSchedulingCatalog, getPatterns, getShiftTypes, getSchedulingFilters, () => getShiftType(randomUUID()), () => getShift(randomUUID()), () => getPattern(randomUUID())]) await expect(read()).rejects.toMatchObject({ status: 401 });
  for (const headers of [new Headers(), sessions.VIEWER]) {
    pageHeaders = headers;
    for (const command of commands) {
      expect(await mutateScheduling(command, {})).toMatchObject({ ok: false, error: expect.stringMatching(/sign in|permission/) });
      expect(await schedulingAction(command, {})).toMatchObject({ ok: false });
    }
  }
  for (const role of ["ADMIN", "COORDINATOR", "VIEWER"]) {
    pageHeaders = sessions[role];
    expect((await getSchedulingCatalog()).canWrite).toBe(role !== "VIEWER");
    expect(await getPatterns()).toHaveProperty("patterns");
    expect(await getSchedule(future, addDays(future, 55))).toHaveProperty("shifts");
  }
  pageHeaders = sessions.ADMIN;
});
it("creates definitions and one-time shifts for both writers, blocks duplicate and inactive/invalid inputs", async () => {
  for (const role of ["ADMIN", "COORDINATOR"]) {
    pageHeaders = sessions[role];
    const id = randomUUID(); definitions.push(id);
    expect(await schedulingAction("definition", { id, name: `${prefix} ${role}`, roleId })).toMatchObject({ ok: true });
    const input = { ...shiftInput(), definitionId: id, role: "VIEWER", status: "CANCELLED", patternId: randomUUID() };
    expect(await schedulingAction("createShift", input)).toEqual({ ok: true, id: input.id });
    expect(await mutateScheduling("createShift", input)).toMatchObject({ ok: false });
    const row = (await getShift(input.id))!.shift;
    expect(row.patternId).toBeNull(); expect(row.occurrenceDate).toBeNull(); expect(row.status).toBe("SCHEDULED");
    expect(row.startsAt.toISOString()).toBe(`${future}T16:00:00.000Z`);
  }
  pageHeaders = sessions.ADMIN;
  for (const fields of [{ date: "2027-02-30" }, { capacity: 0 }, { end: "08:00" }, { definitionId: randomUUID() }, { date: "2000-01-01", endDate: "2000-01-01" }]) expect(await mutateScheduling("createShift", { ...shiftInput(), ...fields })).toMatchObject({ ok: false });
  await db.shiftDefinition.update({ where: { id: definitionId }, data: { isActive: false } });
  try { expect(await mutateScheduling("createPattern", patternInput())).toMatchObject({ ok: false }); } finally { await db.shiftDefinition.update({ where: { id: definitionId }, data: { isActive: true } }); }
});
it("generates eight weeks with inclusive boundaries and an explicit bounded extension", async () => {
  const input = { ...patternInput(), validUntil: addDays(future, 14), start: "23:00", durationMinutes: 120 };
  expect(await mutateScheduling("createPattern", input)).toMatchObject({ ok: true });
  const rows = await shifts(input.id);
  expect(rows.length).toBeGreaterThanOrEqual(2);
  for (const row of rows) {
    expect(row.occurrenceDate!.getUTCDay()).toBe(1);
    expect(dateOnly(row.occurrenceDate!) >= future && dateOnly(row.occurrenceDate!) <= input.validUntil).toBe(true);
    expect(row.startsAt).toEqual(localInstant(dateOnly(row.occurrenceDate!), 1380));
    expect(row.endsAt.getTime() - row.startsAt.getTime()).toBe(7200000);
  }
  const exact = { ...patternInput(), validFrom: dateOnly(rows[0].occurrenceDate!), validUntil: dateOnly(rows[1].occurrenceDate!) };
  expect(await mutateScheduling("createPattern", exact)).toMatchObject({ ok: true });
  expect((await shifts(exact.id)).map(row => dateOnly(row.occurrenceDate!))).toEqual([exact.validFrom, exact.validUntil]);
  const pattern = await newPattern();
  expect(await mutateScheduling("generate", { id: pattern.id, from: future, until: addDays(future, 56) })).toMatchObject({ ok: false });
  expect(await mutateScheduling("generate", { id: pattern.id, from: addDays(future, 56), until: addDays(future, 111) })).toMatchObject({ ok: true, message: expect.stringContaining("Created 8") });
  expect(await shifts(pattern.id)).toHaveLength(16);
});
it("serializes concurrent generation and preserves cancellation, moves and capacity overrides", async () => {
  const pattern = await newPattern();
  const rows = await shifts(pattern.id), row = rows[0];
  const edit = { ...versionOf(row), date: addDays(future, 200), start: "10:00", endDate: addDays(future, 200), end: "12:00", capacity: 9 };
  expect(await mutateScheduling("editShift", edit)).toMatchObject({ ok: true });
  expect(await mutateScheduling("cancelShift", versionOf(rows[1]))).toMatchObject({ ok: true });
  const before = await shifts(pattern.id);
  const request = { id: pattern.id, from: future, until: addDays(future, 55) };
  for (const result of await Promise.all([mutateScheduling("generate", request), mutateScheduling("generate", request)])) expect(result).toMatchObject({ ok: true, message: expect.stringContaining("Created 0") });
  expect(await shifts(pattern.id)).toEqual(before);
  const extension = { id: pattern.id, from: addDays(future, 56), until: addDays(future, 111) };
  const concurrent = await Promise.all([mutateScheduling("generate", extension), mutateScheduling("generate", extension)]);
  expect(concurrent.every(result => result.ok)).toBe(true);
  expect(concurrent.filter(result => result.ok && result.message?.includes("Created 8"))).toHaveLength(1);
  expect(await shifts(pattern.id)).toHaveLength(16);
  await expect(db.shift.update({ where: { id: row.id }, data: { occurrenceDate: dateValue(addDays(future, 300)) } })).rejects.toThrow();
  const canceled = (await getShift(rows[1].id))!.shift;
  expect(await mutateScheduling("editShift", { ...edit, ...versionOf(canceled) })).toMatchObject({ ok: false });
});
it("rejects assigned, historical, completed and stale shift mutations without changing assignments", async () => {
  const pattern = await newPattern(), rows = await shifts(pattern.id);
  for (const status of ["ASSIGNED", "CANCELLED", "COMPLETED"] as const) {
    const row = rows[["ASSIGNED", "CANCELLED", "COMPLETED"].indexOf(status)];
    const assignment = await db.shiftAssignment.create({ data: { volunteerId, shiftId: row.id, status } });
    expect(await mutateScheduling("cancelShift", versionOf(row))).toMatchObject({ ok: false, error: expect.stringContaining("Assignment history") });
    expect(await mutateScheduling("editShift", { ...shiftInput(), ...versionOf(row) })).toMatchObject({ ok: false });
    expect(await db.shiftAssignment.findUnique({ where: { id: assignment.id } })).toEqual(assignment);
  }
  const historical = await db.shift.update({ where: { id: rows[3].id }, data: { startsAt: new Date("2020-01-01T16:00:00Z"), endsAt: new Date("2020-01-01T18:00:00Z") } });
  const complete = await db.shift.update({ where: { id: rows[4].id }, data: { status: "COMPLETED" } });
  for (const row of [historical, complete]) expect(await mutateScheduling("cancelShift", versionOf(row))).toMatchObject({ ok: false });
  const row = rows[5], edits = await Promise.all([1, 2].map(capacity => mutateScheduling("editShift", { ...shiftInput(), ...versionOf(row), capacity })));
  expect(edits.filter(result => result.ok)).toHaveLength(1);
  expect(await db.shift.findUnique({ where: { id: historical.id } })).toEqual(historical);
});
it("revises after all original and moved dates atomically, preserves assignments and rejects old generation", async () => {
  const pattern = await newPattern();
  const rows = await shifts(pattern.id), moved = addDays(future, 150);
  expect(await mutateScheduling("editShift", { ...shiftInput(), ...versionOf(rows[0]), date: moved, endDate: moved })).toMatchObject({ ok: true });
  await db.shiftAssignment.create({ data: { shiftId: rows[1].id, volunteerId } });
  const originals = await shifts(pattern.id), assignments = await db.shiftAssignment.findMany({ where: { shiftId: rows[1].id } });
  const successor = { ...patternInput(), dayOfWeek: 3, validFrom: moved };
  expect(await mutateScheduling("revisePattern", { ...versionOf(pattern), successor })).toMatchObject({ ok: false, error: expect.stringContaining(addDays(moved, 1)) });
  successor.validFrom = addDays(moved, 1);
  const revisions = await Promise.all([successor, { ...successor, id: randomUUID() }].map(value => mutateScheduling("revisePattern", { ...versionOf(pattern), successor: value })));
  expect(revisions.filter(result => result.ok)).toHaveLength(1);
  expect(await shifts(pattern.id)).toEqual(originals);
  expect(await db.shiftAssignment.findMany({ where: { shiftId: rows[1].id } })).toEqual(assignments);
  const old = (await getPattern(pattern.id))!.pattern;
  expect(old.isActive).toBe(false); expect(dateOnly(old.validUntil!)).toBe(moved);
  expect(await mutateScheduling("generate", { id: old.id, from: future, until: addDays(future, 55) })).toMatchObject({ ok: false });
  const winner = revisions.find(result => result.ok)!;
  expect(await shifts(winner.id!)).toHaveLength(8);
});
it("ending does not revise, cancel occurrences, or alter history; generation races obey retirement", async () => {
  const pattern = await newPattern(), before = await shifts(pattern.id);
  const request = { id: pattern.id, from: addDays(future, 56), until: addDays(future, 111) };
  const results = await Promise.all([mutateScheduling("endPattern", { ...versionOf(pattern), validUntil: future }), mutateScheduling("generate", request)]);
  // If generation wins the lock, ending sees a stale version and must be resubmitted.
  if (!results[0].ok) {
    const fresh = (await getPattern(pattern.id))!.pattern;
    expect(await mutateScheduling("endPattern", { ...versionOf(fresh), validUntil: future })).toMatchObject({ ok: true });
  }
  expect((await getPattern(pattern.id))!.pattern.isActive).toBe(false);
  expect((await shifts(pattern.id)).slice(0, 8)).toEqual(before);
  expect(await mutateScheduling("generate", request)).toMatchObject({ ok: false });
});
it("preserves non-Phoenix rules while blocking generation and revision", async () => {
  const pattern = await newPattern();
  const other = await db.shiftPattern.update({ where: { id: pattern.id }, data: { timeZone: "America/New_York" } });
  expect(await mutateScheduling("generate", { id: other.id, from: future, until: addDays(future, 55) })).toMatchObject({ ok: false, error: expect.stringContaining("Phoenix") });
  expect(await mutateScheduling("revisePattern", { ...versionOf(other), successor: { ...patternInput(), validFrom: addDays(future, 100) } })).toMatchObject({ ok: false });
  expect((await getPattern(other.id))!.pattern.timeZone).toBe("America/New_York");
});
it("rolls back pattern creation and revision on SQL failure with safe feedback", async () => {
  const pattern = await newPattern(), before = await shifts(pattern.id);
  const original = db.$transaction.bind(db);
  const forceFailure = () => vi.spyOn(db, "$transaction").mockImplementationOnce(((callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => original(async tx => { await callback(tx); await tx.$executeRawUnsafe("SELECT 1 / 0"); })) as typeof db.$transaction);
  const newInput = patternInput();
  let failure = forceFailure();
  try { expect(await mutateScheduling("createPattern", newInput)).toEqual({ ok: false, error: "Unable to save scheduling changes. Please try again or reload the page." }); } finally { failure.mockRestore(); }
  expect(await db.shiftPattern.findUnique({ where: { id: newInput.id } })).toBeNull();
  expect(await shifts(newInput.id)).toHaveLength(0);
  const successor = { ...patternInput(), validFrom: addDays(future, 100) };
  failure = forceFailure();
  try { expect(await mutateScheduling("revisePattern", { ...versionOf(pattern), successor })).toMatchObject({ ok: false }); } finally { failure.mockRestore(); }
  expect((await getPattern(pattern.id))!.pattern).toEqual(pattern);
  expect(await shifts(pattern.id)).toEqual(before);
  expect(await db.shiftPattern.findUnique({ where: { id: successor.id } })).toBeNull();
});
it("renders viewer details, separate effective/generated ranges and writer workflows", async () => {
  const pattern = await newPattern(), row = (await shifts(pattern.id))[0];
  pageHeaders = sessions.VIEWER;
  const props = { params: Promise.resolve({ id: pattern.id }), searchParams: Promise.resolve({}) };
  const html = renderToStaticMarkup(await PatternPage(props));
  expect(html).toContain("Repeats from"); expect(html).toContain("No end date selected"); expect(html).toContain("Latest scheduled date:"); expect(html).toContain("Read-only access");
  expect(html).not.toContain("Add shifts to calendar"); expect(html).not.toContain("Retire old pattern and create successor");
  expect(renderToStaticMarkup(await NewShiftPage())).toContain("do not have permission");
  const detail = renderToStaticMarkup(await ShiftPage({ params: Promise.resolve({ id: row.id }), searchParams: Promise.resolve({}) }));
  expect(detail).toContain("Original calendar date:"); expect(detail).not.toContain("Save shift changes");
  pageHeaders = sessions.COORDINATOR;
  const writable = renderToStaticMarkup(await PatternPage(props));
  expect(writable).toContain("Add shifts to calendar"); expect(writable).toContain("Shorten repeating schedule"); expect(writable).toContain("Cancel repeating schedule"); expect(writable).not.toContain("successor");
  pageHeaders = sessions.ADMIN;
});

it("generation racing with revision cannot publish an overlapping successor", async () => {
  const pattern = await newPattern();
  const before = await shifts(pattern.id);
  const successor = { ...patternInput(), validFrom: addDays(future, 56), dayOfWeek: 5 };
  const results = await Promise.all([
    mutateScheduling("generate", { id: pattern.id, from: addDays(future, 56), until: addDays(future, 111) }),
    mutateScheduling("revisePattern", { ...versionOf(pattern), successor }),
  ]);
  const old = (await getPattern(pattern.id))!.pattern;
  expect((await shifts(pattern.id)).slice(0, 8)).toEqual(before);
  if (results[1].ok) {
    expect(old.isActive).toBe(false);
    expect(results[0].ok).toBe(false);
    const next = await shifts(successor.id);
    expect(dateOnly(old.validUntil!)).toBe(addDays(successor.validFrom, -1));
    expect(next.every(row => dateOnly(row.occurrenceDate!) >= successor.validFrom)).toBe(true);
  } else {
    expect(results[0].ok).toBe(true);
    expect(old.isActive).toBe(true);
    expect(await db.shiftPattern.findUnique({ where: { id: successor.id } })).toBeNull();
    expect(await shifts(pattern.id)).toHaveLength(16);
  }
});
it("reports invalid date ranges and rejects nonexistent or stale pattern operations", async () => {
  expect((await getSchedule(future, addDays(future, 56))).rangeError).toBeNull();
  expect((await getSchedule("invalid", future)).rangeError).toContain("valid viewing dates");
  expect(await getShift("invalid")).toBeNull(); expect(await getPattern(randomUUID())).toBeNull();
  expect(await mutateScheduling("generate", { id: randomUUID(), from: future, until: addDays(future, 55) })).toMatchObject({ ok: false });
  const pattern = await newPattern();
  expect(await mutateScheduling("generate", { id: pattern.id, from: future, until: addDays(future, 55) })).toMatchObject({ ok: true });
  expect(await mutateScheduling("endPattern", { ...versionOf(pattern), validUntil: future })).toMatchObject({ ok: false, error: expect.stringContaining("changed") });
  const fresh = (await getPattern(pattern.id))!.pattern;
  expect(await mutateScheduling("endPattern", { ...versionOf(fresh), validUntil: addDays(future, -1) })).toMatchObject({ ok: false });
  expect((await getPattern(pattern.id))!.pattern).toEqual(fresh);
});


it("shortens atomically, preserves history and exceptions, and never regenerates canceled dates", async () => {
  const pattern = await newPattern(), rows = await shifts(pattern.id);
  const past = await db.shift.update({ where: { id: rows[0].id }, data: { startsAt: new Date("2020-01-01T16:00:00Z"), endsAt: new Date("2020-01-01T18:00:00Z") } });
  const complete = await db.shift.update({ where: { id: rows[7].id }, data: { status: "COMPLETED" } });
  await db.shiftAssignment.create({ data: { shiftId: past.id, volunteerId, status: "COMPLETED" } });
  const until = dateOnly(rows[2].occurrenceDate!);
  const beforeAssignments = await db.shiftAssignment.findMany({ where: { shiftId: past.id } });
  expect(await mutateScheduling("shortenPattern", { ...versionOf(pattern), validUntil: until })).toMatchObject({ ok: true });
  const shortened = (await getPattern(pattern.id))!.pattern;
  expect(shortened.isActive).toBe(true); expect(dateOnly(shortened.validUntil!)).toBe(until);
  const after = await shifts(pattern.id);
  expect(after[0]).toEqual(past); expect(after[7]).toEqual(complete);
  expect(after.slice(3, 7).every(shift => shift.status === "CANCELLED")).toBe(true);
  expect(await db.shiftAssignment.findMany({ where: { shiftId: past.id } })).toEqual(beforeAssignments);
  expect(await mutateScheduling("extendPattern", { ...versionOf(shortened), from: future, until: addDays(future, 55) })).toMatchObject({ ok: true, message: expect.stringContaining("Created 0") });
  expect(await shifts(pattern.id)).toEqual(after);
});
it("blocks the entire shortening/cancellation when affected shifts have any assignment history", async () => {
  for (const status of ["ASSIGNED", "CANCELLED", "COMPLETED"] as const) {
    const pattern = await newPattern(), before = await shifts(pattern.id);
    const assigned = before[6];
    const assignment = await db.shiftAssignment.create({ data: { shiftId: assigned.id, volunteerId, status } });
    for (const command of ["shortenPattern", "cancelPattern"] as const) {
      const result = await mutateScheduling(command, { ...versionOf(pattern), validUntil: future });
      expect(result).toMatchObject({ ok: false, blockedShifts: [{ id: assigned.id, startsAt: assigned.startsAt.toISOString() }] });
      expect(await shifts(pattern.id)).toEqual(before);
      expect((await getPattern(pattern.id))!.pattern).toEqual(pattern);
      expect(await db.shiftAssignment.findUnique({ where: { id: assignment.id } })).toEqual(assignment);
    }
  }
});
it("cancels a repeating schedule without changing past/completed/canceled rows, and rolls back SQL failures", async () => {
  const pattern = await newPattern(), rows = await shifts(pattern.id);
  const historical = await db.shift.update({ where: { id: rows[0].id }, data: { startsAt: new Date("2020-01-01T16:00:00Z"), endsAt: new Date("2020-01-01T18:00:00Z") } });
  const completed = await db.shift.update({ where: { id: rows[1].id }, data: { status: "COMPLETED" } });
  const canceled = await db.shift.update({ where: { id: rows[2].id }, data: { status: "CANCELLED" } });
  const before = await shifts(pattern.id);
  const original = db.$transaction.bind(db);
  const failure = vi.spyOn(db, "$transaction").mockImplementationOnce(((callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => original(async tx => { await callback(tx); await tx.$executeRawUnsafe("SELECT 1 / 0"); })) as typeof db.$transaction);
  try { expect(await mutateScheduling("cancelPattern", versionOf(pattern))).toMatchObject({ ok: false, error: expect.stringContaining("Unable to save") }); } finally { failure.mockRestore(); }
  expect(await shifts(pattern.id)).toEqual(before); expect((await getPattern(pattern.id))!.pattern.isActive).toBe(true);
  expect(await mutateScheduling("cancelPattern", versionOf(pattern))).toMatchObject({ ok: true });
  const after = await shifts(pattern.id);
  expect(after[0]).toEqual(historical); expect(after[1]).toEqual(completed); expect(after[2]).toEqual(canceled);
  expect(after.slice(3).every(shift => shift.status === "CANCELLED")).toBe(true);
  expect((await getPattern(pattern.id))!.pattern.isActive).toBe(false);
  expect(await mutateScheduling("generate", { id: pattern.id, from: future, until: addDays(future, 55) })).toMatchObject({ ok: false });
  expect(after.map(row => row.occurrenceDate)).toEqual(before.map(row => row.occurrenceDate));
});
it("shows chronological validation fields and filters reads by type, role and canceled status", async () => {
  const input = shiftInput();
  const invalid = await mutateScheduling("createShift", { ...input, endDate: addDays(future, -1) });
  expect(invalid).toMatchObject({ ok: false, fieldErrors: { endDate: expect.stringContaining("end after it starts") } });
  expect(await db.shift.findUnique({ where: { id: input.id } })).toBeNull();
  const pattern = await newPattern(), rows = await shifts(pattern.id);
  expect(await mutateScheduling("cancelShift", versionOf(rows[0]))).toMatchObject({ ok: true });
  const base = await getSchedule(future, addDays(future, 120), { definitionId, roleId });
  expect(base.rangeError).toBeNull(); expect(base.shifts.every(shift => shift.definitionId === definitionId && shift.definition.roleId === roleId && shift.status !== "CANCELLED")).toBe(true);
  const all = await getSchedule(future, addDays(future, 120), { definitionId, showCanceled: true });
  expect(all.shifts.some(shift => shift.id === rows[0].id)).toBe(true);
  expect((await getSchedule(future, addDays(future, 120), { definitionId: randomUUID() })).shifts).toEqual([]);
});

it("redirects only successful form saves after commit, preserves response contracts and blocks UUID replays", async () => {
  const input = shiftInput();
  await expect(schedulingAction("createShift", input, true)).rejects.toThrow(`REDIRECT:/admin/scheduling/${input.id}?saved=1`);
  expect(await db.shift.count({ where: { id: input.id } })).toBe(1);
  expect(await schedulingAction("createShift", input, true)).toMatchObject({ ok: false });
  expect(await db.shift.count({ where: { id: input.id } })).toBe(1);
  const invalid = await schedulingAction("createShift", { ...shiftInput(), endDate: addDays(future, -1) }, true);
  expect(invalid).toMatchObject({ ok: false, fieldErrors: { endDate: expect.any(String) } });
});
it("renders all seven calendar days and preserves filtering in the list alternative", async () => {
  const props = { searchParams: Promise.resolve({ date: future, definitionId, roleId, canceled: "1" }) };
  const html = renderToStaticMarkup(await SchedulingPage(props));
  for (const day of ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) expect(html).toContain(`aria-label="${day} `);
  expect(html).toContain("Jump to date"); expect(html).toContain("Show canceled shifts");
  expect(html).toContain("view=list"); expect(html).toContain(`definitionId=${definitionId}`);
  const list = renderToStaticMarkup(await SchedulingPage({ searchParams: Promise.resolve({ view: "list", from: future, until: addDays(future, 500), definitionId }) }));
  expect(list).toContain("Continue viewing through"); expect(list).not.toContain("spanning one to 56");
  pageHeaders = sessions.VIEWER;
  const viewer = renderToStaticMarkup(await SchedulingPage(props));
  expect(viewer).toContain("Weekly calendar"); expect(viewer).not.toContain("Create one-time shift");
  pageHeaders = sessions.ADMIN;
});

it("manages shift types with writer permissions, versions, fixed roles and duplicate protection", async () => {
  for (const writer of ["ADMIN", "COORDINATOR"]) {
    pageHeaders = sessions[writer];
    const input = { id: randomUUID(), name: `${prefix} catalog ${writer}`, roleId }; definitions.push(input.id);
    expect(await mutateScheduling("definition", input)).toMatchObject({ ok: true });
    expect(await mutateScheduling("definition", input)).toMatchObject({ ok: false });
    let type = (await getShiftType(input.id))!.definition;
    const originalRole = type.role.id;
    expect(await mutateScheduling("updateDefinition", { ...versionOf(type), name: `${input.name} renamed`, isActive: false, roleId: randomUUID() })).toMatchObject({ ok: true });
    expect(await mutateScheduling("updateDefinition", { ...versionOf(type), name: "Stale overwrite", isActive: true })).toMatchObject({ ok: false, error: expect.stringContaining("changed") });
    type = (await getShiftType(input.id))!.definition;
    expect(type.name).toBe(`${input.name} renamed`); expect(type.role.id).toBe(originalRole); expect(type.isActive).toBe(false);
    expect((await getSchedulingCatalog()).definitions.some(row => row.id === type.id)).toBe(false);
    expect(await mutateScheduling("createShift", { ...shiftInput(), definitionId: type.id })).toMatchObject({ ok: false });
    expect(await mutateScheduling("updateDefinition", { ...versionOf(type), name: type.name, isActive: true })).toMatchObject({ ok: true });
    type = (await getShiftType(input.id))!.definition;
    expect((await getSchedulingCatalog()).definitions.some(row => row.id === type.id)).toBe(true);
    expect(await mutateScheduling("deleteDefinition", versionOf(type))).toMatchObject({ ok: true });
    expect(await getShiftType(type.id)).toBeNull();
  }
  pageHeaders = sessions.ADMIN;
});
it("preserves shift and pattern relationships on rename/deactivation and blocks deletion of all references", async () => {
  const def = { id: randomUUID(), name: `${prefix} history catalog`, roleId }; definitions.push(def.id);
  expect(await mutateScheduling("definition", def)).toMatchObject({ ok: true });
  const past = await db.shift.create({ data: { definitionId: def.id, startsAt: new Date("2020-01-01T16:00:00Z"), endsAt: new Date("2020-01-01T18:00:00Z"), capacity: 1, status: "CANCELLED" } });
  const assignment = await db.shiftAssignment.create({ data: { shiftId: past.id, volunteerId, status: "CANCELLED" } });
  const type = (await getShiftType(def.id))!.definition;
  expect(await mutateScheduling("deleteDefinition", versionOf(type))).toMatchObject({ ok: false, error: expect.stringContaining("Deactivate") });
  expect(await mutateScheduling("updateDefinition", { ...versionOf(type), name: `${prefix} corrected label`, isActive: false })).toMatchObject({ ok: true });
  expect((await getShift(past.id))!.shift.definition.name).toBe(`${prefix} corrected label`);
  expect(await db.shift.findUnique({ where: { id: past.id } })).toEqual(past);
  expect(await db.shiftAssignment.findUnique({ where: { id: assignment.id } })).toEqual(assignment);
  const patternOnlyId = randomUUID(); definitions.push(patternOnlyId);
  await db.shiftDefinition.create({ data: { id: patternOnlyId, name: `${prefix} pattern only`, roleId } });
  await db.shiftPattern.create({ data: { definitionId: patternOnlyId, dayOfWeek: 1, startMinute: 540, durationMinutes: 60, capacity: 1, validFrom: dateValue(future), isActive: false } });
  const patternType = (await getShiftType(patternOnlyId))!.definition;
  expect(await mutateScheduling("deleteDefinition", versionOf(patternType))).toMatchObject({ ok: false, error: expect.stringContaining("repeating schedule") });
  expect(await db.shift.count({ where: { definitionId: patternOnlyId } })).toBe(0);
});
it("rejects mismatched/missing operational roles on one-time and repeating creation", async () => {
  for (const [command, base] of [["createShift", shiftInput()], ["createPattern", patternInput()]] as const) {
    const mismatch = { ...base, roleId: randomUUID() };
    expect(await mutateScheduling(command, mismatch)).toMatchObject({ ok: false, fieldErrors: { definitionId: expect.stringContaining("selected role") } });
    expect(await mutateScheduling(command, { ...base, roleId: undefined })).toMatchObject({ ok: false, fieldErrors: { roleId: expect.any(String) } });
    expect(await db.shift.count({ where: { id: base.id } })).toBe(0); expect(await db.shiftPattern.count({ where: { id: base.id } })).toBe(0);
  }
  await db.volunteerRole.update({ where: { id: roleId }, data: { isActive: false } });
  try {
    expect(await mutateScheduling("definition", { id: randomUUID(), name: "Unavailable", roleId })).toMatchObject({ ok: false });
    expect(await mutateScheduling("createShift", shiftInput())).toMatchObject({ ok: false });
    const inactive = await db.shiftDefinition.create({ data: { name: prefix, roleId, isActive: false } }); definitions.push(inactive.id);
    expect(await mutateScheduling("updateDefinition", { ...versionOf(inactive), name: inactive.name, isActive: true })).toMatchObject({ ok: false });
  } finally { await db.volunteerRole.update({ where: { id: roleId }, data: { isActive: true } }); }
});
it("applies OR within roles/types, AND across groups, and validates filter parameters", async () => {
  const otherRole = await db.volunteerRole.create({ data: { name: `${prefix} other role` } });
  const typeIds = [randomUUID(), randomUUID(), randomUUID()]; definitions.push(...typeIds);
  try {
    await db.shiftDefinition.createMany({ data: typeIds.map((id, i) => ({ id, name: `${prefix} filter ${i}`, roleId: i === 2 ? otherRole.id : roleId })) });
    const ids: string[] = [];
    for (const definitionId of typeIds) {
      const row = await db.shift.create({ data: { definitionId, startsAt: localInstant(future, 540), endsAt: localInstant(future, 600), capacity: 1 } }); ids.push(row.id);
    }
    const matches = async (filters: Parameters<typeof getSchedule>[2]) => (await getSchedule(future, future, filters)).shifts.filter(shift => ids.includes(shift.id)).map(shift => shift.definitionId).sort();
    expect(await matches({ roleIds: [roleId, otherRole.id], definitionIds: typeIds })).toEqual([...typeIds].sort());
    expect(await matches({ roleIds: [roleId], definitionIds: typeIds })).toEqual(typeIds.slice(0, 2).sort());
    expect(await matches({ roleIds: [], definitionIds: [typeIds[0], typeIds[2]] })).toEqual([typeIds[0], typeIds[2]].sort());
    expect(await matches({ roleIds: [otherRole.id], definitionIds: [] })).toEqual([typeIds[2]]);
    expect(await matches({ roleIds: [], definitionIds: [] })).toEqual([...typeIds].sort());
    expect(await matches({ roleIds: [roleId], definitionIds: [typeIds[2]] })).toEqual([]);
    expect((await getSchedule(future, future, { roleIds: ["invalid"] })).rangeError).toBeTruthy();
    expect((await getSchedule(future, future, { definitionIds: Array(101).fill(typeIds[0]) })).rangeError).toBeTruthy();
    expect((await getSchedule(future, future, { page: 0 })).rangeError).toBeTruthy();
    const html = renderToStaticMarkup(await SchedulingPage({ searchParams: Promise.resolve({ date: future, roleId: [roleId, otherRole.id], definitionId: [typeIds[0], typeIds[2]], canceled: "1" }) }));
    expect(html).toContain("Clear filters"); expect(html).toContain(`roleId=${otherRole.id}`); expect(html).toContain(`definitionId=${typeIds[2]}`); expect(html).toContain("canceled=1");
    const outside = renderToStaticMarkup(await SchedulingPage({ searchParams: Promise.resolve({ date: future, roleId, definitionId: typeIds[2] }) }));
    expect(outside).toContain("outside the chosen roles cannot match");
    expect(renderToStaticMarkup(await SchedulingPage({ searchParams: Promise.resolve({ page: "invalid" }) }))).toContain("Check the viewing dates");
  } finally {
    await db.shift.deleteMany({ where: { definitionId: { in: typeIds } } });
    await db.shiftDefinition.deleteMany({ where: { id: { in: typeIds } } });
    await db.volunteerRole.delete({ where: { id: otherRole.id } });
  }
});
it("renders catalog read-only for VIEWER and redirects successful catalog forms after commit", async () => {
  const id = randomUUID(); definitions.push(id);
  await expect(schedulingAction("definition", { id, roleId, name: `${prefix} redirected catalog` }, true)).rejects.toThrow(`REDIRECT:/admin/scheduling/types/${id}?saved=1`);
  const type = (await getShiftType(id))!.definition;
  pageHeaders = sessions.VIEWER;
  const html = renderToStaticMarkup(await ShiftTypePage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));
  expect(html).toContain("Read-only access"); expect(html).not.toContain("Save shift type"); expect(html).not.toContain("Permanently delete unused");
  expect(renderToStaticMarkup(await ShiftTypesPage({}))).not.toContain(">Create shift type</a>");
  expect(renderToStaticMarkup(await NewShiftTypePage())).toContain("do not have permission");
  pageHeaders = sessions.COORDINATOR;
  await expect(schedulingAction("updateDefinition", { ...versionOf(type), name: `${prefix} redirected rename`, isActive: false }, true)).rejects.toThrow(`REDIRECT:/admin/scheduling/types/${id}?saved=1`);
  const edited = (await getShiftType(id))!.definition;
  await expect(schedulingAction("deleteDefinition", versionOf(edited), true)).rejects.toThrow("REDIRECT:/admin/scheduling/types?deleted=1");
  pageHeaders = sessions.ADMIN;
});

it("serializes simultaneous catalog edits and deletion against new shift/pattern references", async () => {
  const typeId = randomUUID(); definitions.push(typeId);
  expect(await mutateScheduling("definition", { id: typeId, roleId, name: `${prefix} concurrent catalog` })).toMatchObject({ ok: true });
  const type = (await getShiftType(typeId))!.definition;
  const edits = await Promise.all(["first", "second"].map(suffix => mutateScheduling("updateDefinition", { ...versionOf(type), name: `${prefix} ${suffix}`, isActive: true })));
  expect(edits.filter(result => result.ok)).toHaveLength(1);
  for (const command of ["createShift", "createPattern"] as const) {
    const id = randomUUID(); definitions.push(id);
    expect(await mutateScheduling("definition", { id, roleId, name: `${prefix} reference race ${command}` })).toMatchObject({ ok: true });
    const current = (await getShiftType(id))!.definition;
    const results = await Promise.all([
      mutateScheduling(command, { ...(command === "createShift" ? shiftInput() : patternInput()), definitionId: id }),
      mutateScheduling("deleteDefinition", versionOf(current)),
    ]);
    expect(results.filter(result => result.ok)).toHaveLength(1);
    if (results[0].ok) {
      expect(await getShiftType(id)).not.toBeNull();
      expect(await db.shift.count({ where: { definitionId: id } })).toBeGreaterThan(0);
    } else {
      expect(await getShiftType(id)).toBeNull();
      expect(await db.shift.count({ where: { definitionId: id } })).toBe(0);
      expect(await db.shiftPattern.count({ where: { definitionId: id } })).toBe(0);
    }
  }
});
it("rolls back catalog update/deletion on SQL failure without exposing internal errors", async () => {
  const id = randomUUID(); definitions.push(id);
  expect(await mutateScheduling("definition", { id, roleId, name: `${prefix} rollback catalog` })).toMatchObject({ ok: true });
  const type = (await getShiftType(id))!.definition;
  const original = db.$transaction.bind(db);
  for (const command of ["updateDefinition", "deleteDefinition"] as const) {
    const failure = vi.spyOn(db, "$transaction").mockImplementationOnce(((callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => original(async tx => { await callback(tx); await tx.$executeRawUnsafe("SELECT 1 / 0"); })) as typeof db.$transaction);
    try {
      const result = await mutateScheduling(command, { ...versionOf(type), name: "Must roll back", isActive: false });
      expect(result).toMatchObject({ ok: false, error: expect.stringContaining("Unable to save") });
      expect(JSON.stringify(result)).not.toMatch(/division|SELECT|Prisma/);
    } finally { failure.mockRestore(); }
    expect((await getShiftType(id))!.definition).toEqual(type);
  }
});
it("rejects ambiguous legacy backfills, even if an unknown record matches its current rule", async () => {
  const url = readDatabaseUrl(process.env, "TEST_DATABASE_URL");
  const client = new Client({ connectionString: url });
  const schema = `migration_test_${randomUUID().replaceAll("-", "")}`;
  const migration = readFileSync("prisma/migrations/20261110000000_shift_occurrence_date/migration.sql", "utf8").replace(/^BEGIN;\s*/, "").replace(/COMMIT;\s*$/, "");
  try {
    await client.connect(); await client.query("BEGIN");
    await client.query(`CREATE SCHEMA "${schema}"`); await client.query(`SET LOCAL search_path TO "${schema}"`);
    await client.query(readFileSync("prisma/migrations/20261108000000_initial/migration.sql", "utf8"));
    await client.query('INSERT INTO "VolunteerRole" (id,name,"updatedAt") VALUES ($1,\'migration fixture\',now())', [roleId]);
    await client.query('INSERT INTO "ShiftDefinition" (id,name,"roleId","updatedAt") VALUES ($1,\'fixture\',$2,now())', [definitionId, roleId]);
    const pattern = patternInput();
    await client.query('INSERT INTO "ShiftPattern" (id,"definitionId","dayOfWeek","startMinute","durationMinutes",capacity,"validFrom","updatedAt") VALUES ($1,$2,1,540,180,3,\'2027-01-01\',now())', [pattern.id, definitionId]);
    await client.query('INSERT INTO "Shift" (id,"definitionId","patternId","startsAt","endsAt",capacity,"updatedAt") VALUES ($1,$2,$3,\'2027-01-04T16:00:00Z\',\'2027-01-04T19:00:00Z\',3,now())', [randomUUID(), definitionId, pattern.id]);
    await client.query("SAVEPOINT before_migration");
    await expect(client.query(migration)).rejects.toThrow("Ambiguous preexisting recurring shifts");
    await client.query("ROLLBACK TO SAVEPOINT before_migration");
    expect((await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name='Shift' AND column_name='occurrenceDate'", [schema])).rowCount).toBe(0);
  } finally { await client.query("ROLLBACK"); await client.end(); }
});
