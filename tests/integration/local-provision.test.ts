import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createDatabaseClient } from "../../src/server/database/client";
import { readDatabaseUrl } from "../../src/server/database/environment";
import { verifyTarget } from "../../scripts/database-target";
import { createAuth } from "../../src/server/auth/factory";
import { provisionLocalTestUser } from "../../src/server/auth/provision";
let db: ReturnType<typeof createDatabaseClient>;
const prefix = `local-provision-${randomUUID()}`;
const env = { ...process.env, NODE_ENV: "test", DATABASE_URL: process.env.TEST_DATABASE_URL, BETTER_AUTH_URL: "http://localhost:3000", BETTER_AUTH_SECRET: randomBytes(48).toString("base64url") };
const input = (role: "VIEWER" | "COORDINATOR") => ({ role, name: prefix, email: `${prefix}-${role.toLowerCase()}@example.invalid`, password: randomBytes(24).toString("base64url") });
beforeAll(async () => {
  const url = readDatabaseUrl(process.env, "TEST_DATABASE_URL"); await verifyTarget(url, "test");
  const migration = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy", "--config", "prisma.config.ts"], { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" });
  if (migration.status !== 0) throw new Error("Test migration failed; no reset attempted.");
  db = createDatabaseClient(url);
});
afterAll(async () => { if (db) { await db.user.deleteMany({ where: { email: { startsWith: prefix } } }); await db.$disconnect(); } });
it("provisions real VIEWER and COORDINATOR credentials without sessions or public signup", async () => {
  const auth = createAuth(db, env);
  for (const role of ["VIEWER", "COORDINATOR"] as const) {
    const value = input(role);
    const result = await provisionLocalTestUser(db, env, value, "test");
    expect(Object.keys(result)).toEqual(["id"]);
    const user = await db.user.findUniqueOrThrow({ where: { id: result.id } });
    expect(user.role).toBe(role); expect(await db.session.count({ where: { userId: result.id } })).toBe(0);
    const credential = await db.account.findFirstOrThrow({ where: { userId: result.id, providerId: "credential" } });
    expect(credential.password).toBeTruthy(); expect(credential.password).not.toBe(value.password);
    const response = await auth.api.signInEmail({ body: { email: value.email, password: value.password }, asResponse: true });
    expect(response.status).toBe(200);
    const before = await db.account.findUniqueOrThrow({ where: { id: credential.id } });
    await expect(provisionLocalTestUser(db, env, { ...value, password: randomBytes(24).toString("base64url") }, "test")).rejects.toThrow("already exists");
    expect(await db.account.findUnique({ where: { id: credential.id } })).toEqual(before);
  }
  await expect(auth.api.signUpEmail({ body: { ...input("VIEWER"), email: `${prefix}-public@example.invalid` } })).rejects.toThrow();
});
it("refuses production, remote or mismatched targets, ADMIN role and invalid inputs", async () => {
  for (const override of [{ NODE_ENV: "production" }, { DATABASE_URL: "postgresql://liminal_test:unused@remote.invalid:5435/liminal_test" }]) await expect(provisionLocalTestUser(db, { ...env, ...override }, input("VIEWER"), "test")).rejects.toThrow();
  await expect(provisionLocalTestUser(db, env, input("VIEWER"))).rejects.toThrow();
  for (const changes of [{ role: "ADMIN" }, { password: "short" }, { email: "invalid" }]) await expect(provisionLocalTestUser(db, env, { ...input("VIEWER"), ...changes } as Parameters<typeof provisionLocalTestUser>[2], "test")).rejects.toThrow();
  const devEnv = { ...env, DATABASE_URL: "postgresql://liminal_dev:unused@127.0.0.1:5434/liminal_dev" };
  await expect(provisionLocalTestUser(db, devEnv, input("VIEWER"))).rejects.toThrow("live database identity");
});
it("serializes duplicate provisioning and the CLI refuses noninteractive use without echoing secrets", async () => {
  const value = { ...input("VIEWER"), email: `${prefix}-concurrent@example.invalid` };
  const results = await Promise.allSettled([provisionLocalTestUser(db, env, value, "test"), provisionLocalTestUser(db, env, value, "test")]);
  expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
  expect(await db.user.count({ where: { email: value.email } })).toBe(1);
  const cli = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/provision-test-user.ts"], { env: process.env, encoding: "utf8", input: value.password });
  expect(cli.status).not.toBe(0); expect(cli.stdout).not.toContain(value.password); expect(cli.stderr).not.toContain(value.password);
});
