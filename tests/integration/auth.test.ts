import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { betterAuth } from "better-auth";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createDatabaseClient } from "../../src/server/database/client";
import { readDatabaseUrl } from "../../src/server/database/environment";
import { verifyTarget } from "../../scripts/database-target";
import { createAuth, createAuthHandler } from "../../src/server/auth/factory";
import { createAuthorization } from "../../src/server/auth/authorization";
import { provisionInitialAdmin } from "../../src/server/auth/provision";

import { renderToStaticMarkup } from "react-dom/server";
import DashboardPage from "../../src/app/admin/(protected)/page";
import VolunteersPage from "../../src/app/admin/(protected)/volunteers/page";
import SchedulingPage from "../../src/app/admin/(protected)/scheduling/page";
import LoginPage from "../../src/app/admin/login/page";
import ProtectedLayout from "../../src/app/admin/(protected)/layout";
import { getDashboard, getVolunteers, getShifts } from "../../src/server/admin/queries";
import { readAdminPage } from "../../src/server/admin/page-access";

let pageHeaders = new Headers();
// Only the Next request context/singleton wiring is replaced; real auth, RBAC and queries run.
vi.mock("next/headers", () => ({ headers: async () => pageHeaders }));
vi.mock("../../src/server/db", () => ({ getDatabase: () => db }));
vi.mock("../../src/server/auth/index", () => ({ getAuth: () => auth }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));

const env = { BETTER_AUTH_URL: "http://localhost:3000", BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"), NODE_ENV: "test" };
const password = randomBytes(24).toString("base64url");
const prefix = `auth-test-${randomUUID()}`;
let db: ReturnType<typeof createDatabaseClient>;
let auth: ReturnType<typeof createAuth>;
let handle: ReturnType<typeof createAuthHandler>;
let authorization: ReturnType<typeof createAuthorization>;
const users: Record<string, { id: string; email: string }> = {};
let ip = 1;

beforeAll(async () => {
  const url = readDatabaseUrl(process.env, "TEST_DATABASE_URL");
  await verifyTarget(url, "test");
  const migration = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy", "--config", "prisma.config.ts"], { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" });
  if (migration.status !== 0) throw new Error("Auth test migration failed; no database reset attempted.");
  db = createDatabaseClient(url);
  auth = createAuth(db, env);
  handle = createAuthHandler(auth);
  authorization = createAuthorization(auth, db);
  // Test-only unmounted signup instance; same supported API as local provisioning.
  const fixtures = betterAuth({ ...auth.options, emailAndPassword: { ...auth.options.emailAndPassword, enabled: true, disableSignUp: false, autoSignIn: false } });
  for (const role of ["COORDINATOR", "VIEWER"] as const) {
    const email = `${prefix}-${role.toLowerCase()}@example.invalid`;
    const { user } = await fixtures.api.signUpEmail({ body: { email, password, name: "Synthetic auth test" } });
    users[role] = { id: user.id, email };
    await db.user.update({ where: { id: user.id }, data: { role } });
  }
});
afterAll(async () => {
  if (db) {
    // Only this run's unique synthetic identities; cascades remove their sessions/accounts.
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
    await db.$disconnect();
  }
});

async function request(path: string, body?: Record<string, unknown>, cookie?: string, headers: Record<string, string> = {}) {
  return handle(new Request(`${env.BETTER_AUTH_URL}/api/auth/${path}`, {
    method: body ? "POST" : "GET",
    headers: { origin: env.BETTER_AUTH_URL, "content-type": "application/json", "x-forwarded-for": `192.0.2.${ip++}`, ...(cookie ? { cookie } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }));
}
async function login(role = "VIEWER") {
  const response = await request("sign-in/email", { email: users[role].email, password });
  expect(response.status).toBe(200);
  const cookie = response.headers.getSetCookie().find(value => value.startsWith("better-auth.session_token="))?.split(";")[0];
  expect(Boolean(cookie)).toBe(true);
  return { response, cookie: cookie! };
}
const authenticated = (cookie: string) => new Headers({ cookie });

describe("real Better Auth / PostgreSQL authentication and authorization", () => {
  it("provisions exactly one initial admin with library credentials and rejects duplicates without replacing them", async () => {
    const email = `${prefix}-admin@example.invalid`;
    await expect(provisionInitialAdmin(db, env, { email: users.VIEWER.email, name: "Existing identity", password })).rejects.toThrow("already exists");
    await expect(provisionInitialAdmin(db, env, { email, name: "Invalid", password: "short" })).rejects.toThrow("12–128");
    expect(await db.user.count({ where: { email } })).toBe(0);
    const attempts = await Promise.allSettled([1, 2].map(() => provisionInitialAdmin(db, env, { email, name: "Synthetic administrator", password })));
    expect(attempts.filter(attempt => attempt.status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter(attempt => attempt.status === "rejected")).toHaveLength(1);
    const result = (attempts.find(attempt => attempt.status === "fulfilled") as PromiseFulfilledResult<{ id: string }>).value;
    users.ADMIN = { id: result.id, email };
    expect((await db.user.findUniqueOrThrow({ where: { id: result.id } })).role).toBe("ADMIN");
    const account = await db.account.findFirstOrThrow({ where: { userId: result.id } });
    expect(account.providerId).toBe("credential");
    expect(account.password === password).toBe(false);
    expect(await db.session.count({ where: { userId: result.id } })).toBe(0);
    expect(await db.volunteerProfile.count({ where: { userId: result.id } })).toBe(0);
    await expect(provisionInitialAdmin(db, env, { email, name: "Duplicate", password: randomBytes(24).toString("base64url") })).rejects.toThrow("already exists");
    await expect(provisionInitialAdmin(db, env, { email: `${prefix}-second@example.invalid`, name: "Second", password })).rejects.toThrow("already exists");
    expect((await db.account.findUniqueOrThrow({ where: { id: account.id } })).password === account.password).toBe(true);
    await login("ADMIN");
  });

  it("signs in, persists the session on multiple requests, and sets HttpOnly SameSite cookies", async () => {
    const { response, cookie } = await login();
    const setCookie = response.headers.getSetCookie().join(";");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(response.headers.get("cache-control")).toBe("no-store");
    for (let i = 0; i < 2; i++) {
      const session = await (await request("get-session", undefined, cookie)).json();
      expect(session.user.id).toBe(users.VIEWER.id);
      expect(session.user.role).toBe("VIEWER");
    }
  });

  it("returns the same generic error for an unknown email and a wrong password", async () => {
    const wrong = await request("sign-in/email", { email: users.VIEWER.email, password: "incorrect-password" });
    const unknown = await request("sign-in/email", { email: `${prefix}-missing@example.invalid`, password: "incorrect-password" });
    expect(wrong.status).toBe(401); expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
  });

  it("rejects public signup at the library endpoint, including privileged input", async () => {
    const email = `${prefix}-attack@example.invalid`;
    const response = await request("sign-up/email", { email, password, name: "Attack", role: "ADMIN", isActive: true });
    expect(response.status).toBe(400);
    await expect(auth.api.signUpEmail({ body: { email, password, name: "Attack" } })).rejects.toMatchObject({ statusCode: 400 });
    expect(await db.user.count({ where: { email } })).toBe(0);
  });

  it("invalidates the database session on logout even when the old cookie is replayed", async () => {
    const { cookie } = await login();
    expect((await request("sign-out", {}, cookie)).status).toBe(200);
    expect(await (await request("get-session", undefined, cookie)).json()).toBeNull();
    await expect(authorization.requireUser(authenticated(cookie))).rejects.toMatchObject({ status: 401 });
  });

  it("rejects missing, tampered, expired, and deleted sessions", async () => {
    expect(await (await request("get-session")).json()).toBeNull();
    const { cookie } = await login();
    expect(await (await request("get-session", undefined, `${cookie}tampered`)).json()).toBeNull();
    await db.session.updateMany({ where: { userId: users.VIEWER.id }, data: { expiresAt: new Date(Date.now() - 60000) } });
    expect(await (await request("get-session", undefined, cookie)).json()).toBeNull();
    await expect(authorization.requireUser(authenticated(cookie))).rejects.toMatchObject({ status: 401 });
    const next = await login();
    await db.session.deleteMany({ where: { userId: users.VIEWER.id } });
    expect(await (await request("get-session", undefined, next.cookie)).json()).toBeNull();
  });

  it("denies disabled users both new login and access through previously valid sessions", async () => {
    const { cookie } = await login();
    await db.user.update({ where: { id: users.VIEWER.id }, data: { isActive: false } });
    try {
      const disabled = await request("sign-in/email", { email: users.VIEWER.email, password });
      expect(disabled.status).toBe(401);
      expect((await disabled.json()).code).toBe("INVALID_EMAIL_OR_PASSWORD");
      expect(await (await request("get-session", undefined, cookie)).json()).toBeNull();
      await expect(authorization.requirePermission("volunteers:read", authenticated(cookie))).rejects.toBeInstanceOf(Error);
    } finally { await db.user.update({ where: { id: users.VIEWER.id }, data: { isActive: true } }); }
  });

  it.each(["ADMIN", "COORDINATOR", "VIEWER"])("enforces the complete permission matrix for %s", async role => {
    const { cookie } = await login(role);
    const headers = authenticated(cookie);
    const all = ["volunteers:read", "volunteers:write", "scheduling:read", "scheduling:write", "events:read", "events:write", "finances:read", "finances:write", "accounts:manage"] as const;
    for (const permission of all) {
      const allowed = role === "ADMIN" || (role === "COORDINATOR" ? !permission.startsWith("finances:") && permission !== "accounts:manage" : ["volunteers:read", "scheduling:read"].includes(permission));
      if (allowed) expect((await authorization.requirePermission(permission, headers)).id).toBe(users[role].id);
      else await expect(authorization.requirePermission(permission, headers)).rejects.toMatchObject({ status: 403 });
    }
    expect((await authorization.requireRole(role as "ADMIN" | "COORDINATOR" | "VIEWER", headers)).id).toBe(users[role].id);
    if (role !== "ADMIN") await expect(authorization.requireRole("ADMIN", headers)).rejects.toMatchObject({ status: 403 });
  });

  it("uses current privileges after a role is revoked with the same session", async () => {
    const { cookie } = await login("COORDINATOR");
    await authorization.requirePermission("volunteers:write", authenticated(cookie));
    await db.user.update({ where: { id: users.COORDINATOR.id }, data: { role: "VIEWER" } });
    try {
      await expect(authorization.requirePermission("volunteers:write", authenticated(cookie))).rejects.toMatchObject({ status: 403 });
      expect((await (await request("get-session", undefined, cookie)).json()).user.role).toBe("VIEWER");
    } finally { await db.user.update({ where: { id: users.COORDINATOR.id }, data: { role: "COORDINATOR" } }); }
  });

  it("rejects public field updates and ignores privileged login input", async () => {
    const { cookie } = await login();
    expect((await request("update-user", { role: "ADMIN", isActive: false }, cookie)).status).toBe(404);
    // Even the library's server API refuses input:false fields.
    await expect(auth.api.updateUser({ headers: authenticated(cookie), body: { role: "ADMIN", isActive: false } as never })).rejects.toMatchObject({ statusCode: 400 });
    expect((await request("sign-in/email", { email: users.VIEWER.email, password, role: "ADMIN", isActive: false })).status).toBe(200);
    const user = await db.user.findUniqueOrThrow({ where: { id: users.VIEWER.id } });
    expect(user.role).toBe("VIEWER"); expect(user.isActive).toBe(true);
  });

  it("rejects unauthorized direct calls to protected operations", async () => {
    let performed = false;
    const operation = async () => { await authorization.requirePermission("accounts:manage", new Headers()); performed = true; };
    await expect(operation()).rejects.toMatchObject({ status: 401 });
    expect(performed).toBe(false);
  });

  it("blocks hostile origins and redirects, and rate limits repeated sign-in attempts", async () => {
    const body = { email: users.VIEWER.email, password };
    expect((await request("sign-in/email", body, undefined, { origin: "https://evil.example" })).status).toBe(403);
    expect((await request("sign-in/email", body, undefined, { origin: "", "sec-fetch-site": "cross-site", "sec-fetch-mode": "navigate" })).status).toBe(403);
    const { cookie } = await login();
    expect((await request("sign-out", {}, cookie, { origin: "" })).status).toBe(403);
    expect((await request("sign-in/email", { ...body, callbackURL: "https://evil.example" })).status).toBe(403);
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await request("sign-in/email", { email: users.VIEWER.email, password: "incorrect-password" }, undefined, { "x-forwarded-for": "198.51.100.200" })).status);
    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });

  it("sets Secure cookies on HTTPS and has a fixed eight-hour session lifetime", async () => {
    const secure = createAuth(db, { ...env, BETTER_AUTH_URL: "https://admin.example.invalid", NODE_ENV: "production" });
    const response = await secure.handler(new Request("https://admin.example.invalid/api/auth/sign-in/email", { method: "POST", headers: { origin: "https://admin.example.invalid", "content-type": "application/json", "x-forwarded-for": "203.0.113.10" }, body: JSON.stringify({ email: users.VIEWER.email, password }) }));
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().some(value => value.includes("Secure") && value.includes("HttpOnly"))).toBe(true);
    const session = await db.session.findFirstOrThrow({ where: { userId: users.VIEWER.id }, orderBy: { createdAt: "desc" } });
    expect(Math.abs(session.expiresAt.getTime() - session.createdAt.getTime() - 8 * 60 * 60 * 1000)).toBeLessThan(2000);
  });
  it("protects every Stage D query directly, supports all read roles, and reflects PostgreSQL changes", async () => {
    pageHeaders = new Headers();
    for (const query of [getDashboard, getVolunteers, getShifts]) {
      await expect(query()).rejects.toMatchObject({ status: 401 });
      await expect(readAdminPage<unknown>(query)).rejects.toThrow("REDIRECT:/admin/login");
    }
    for (const role of ["ADMIN", "COORDINATOR", "VIEWER"]) {
      pageHeaders = authenticated((await login(role)).cookie);
      const summary = await getDashboard();
      expect(summary.activeVolunteers).toBe(await db.volunteerProfile.count({ where: { status: "ACTIVE" } }));
      expect(summary.scheduledShifts).toBe(await db.shift.count({ where: { status: "SCHEDULED" } }));
      expect((await getVolunteers()).length).toBe(await db.volunteerProfile.count());
      expect((await getShifts()).length).toBe(await db.shift.count());
    }
    const before = await getDashboard();
    const record = await db.volunteerProfile.create({ data: { displayName: `Stage D ${prefix}` } });
    try {
      expect((await getDashboard()).activeVolunteers).toBe(before.activeVolunteers + 1);
      const shown = (await getVolunteers()).find(row => row.id === record.id)!;
      expect(shown.displayName).toBe(`Stage D ${prefix}`);
      expect(shown).not.toHaveProperty("email");
      expect(shown).not.toHaveProperty("userId");
    } finally { await db.volunteerProfile.delete({ where: { id: record.id } }); }
    const cookie = (await login()).cookie;
    pageHeaders = authenticated(cookie);
    await request("sign-out", {}, cookie);
    await expect(getDashboard()).rejects.toMatchObject({ status: 401 });
    const disabled = (await login()).cookie;
    pageHeaders = authenticated(disabled);
    await db.user.update({ where: { id: users.VIEWER.id }, data: { isActive: false } });
    try { await expect(getVolunteers()).rejects.toBeInstanceOf(Error); }
    finally { await db.user.update({ where: { id: users.VIEWER.id }, data: { isActive: true } }); }
  });

  it("handles empty query results and sanitizes database and permission failures for pages", async () => {
    // An empty read result is distinct from an outage; no database records are removed.
    expect(await readAdminPage(async () => [])).toEqual({ data: [], error: null });
    pageHeaders = authenticated((await login()).cookie);
    const failure = vi.spyOn(db.volunteerProfile, "findMany").mockRejectedValueOnce(new Error("private database details"));
    try {
      const result = await readAdminPage(getVolunteers);
      expect(result.data).toBeNull();
      expect(result.error).toContain("temporarily unavailable");
      expect(JSON.stringify(result)).not.toContain("private database details");
    } finally { failure.mockRestore(); }
    const { AuthorizationError } = await import("../../src/server/auth/authorization");
    expect((await readAdminPage(async () => { throw new AuthorizationError(403); })).error).toContain("permission");
  });

  it("renders protected pages through real sessions and redirects login visitors correctly", async () => {
    pageHeaders = new Headers();
    expect(renderToStaticMarkup(await LoginPage())).toContain('autoComplete="current-password"');
    await expect(ProtectedLayout({ children: null })).rejects.toThrow("REDIRECT:/admin/login");
    pageHeaders = authenticated((await login()).cookie);
    await expect(LoginPage()).rejects.toThrow("REDIRECT:/admin");
    expect(renderToStaticMarkup(await DashboardPage())).toContain(String((await getDashboard()).activeVolunteers));
    expect(renderToStaticMarkup(await VolunteersPage({}))).toContain("Recorded volunteers");
    expect(renderToStaticMarkup(await SchedulingPage())).toContain("America/Phoenix");
    const empty = vi.spyOn(db.volunteerProfile, "findMany").mockResolvedValueOnce([]);
    try { expect(renderToStaticMarkup(await VolunteersPage({}))).toContain("No volunteers are recorded."); }
    finally { empty.mockRestore(); }
    const noShifts = vi.spyOn(db.shift, "findMany").mockResolvedValueOnce([]);
    try { expect(renderToStaticMarkup(await SchedulingPage())).toContain("No shifts are recorded."); }
    finally { noShifts.mockRestore(); }
    const failure = vi.spyOn(db.user, "findUnique").mockRejectedValueOnce(new Error("private connection details"));
    try {
      const html = renderToStaticMarkup(await ProtectedLayout({ children: "protected child" }));
      expect(html).toContain("temporarily unavailable");
      expect(html).not.toContain("protected child");
      expect(html).not.toContain("private connection details");
    } finally { failure.mockRestore(); }
  });

});
