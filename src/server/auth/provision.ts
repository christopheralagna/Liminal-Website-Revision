import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { z } from "zod";
import type { createDatabaseClient } from "../database/client";
import { createAuth } from "./factory";

const inputSchema = z.object({
  email: z.email().transform(value => value.trim().toLowerCase()),
  name: z.string().trim().min(1).max(200),
  password: z.string().min(12).max(128),
});

// Local tooling only. Never export this function from an HTTP route or server action.
export async function provisionInitialAdmin(database: ReturnType<typeof createDatabaseClient>, env: Record<string, string | undefined>, input: { email: string; name: string; password: string }) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) throw new Error("Provide a valid email, name, and a password of 12–128 characters.");
  const auth = createAuth(database, env);
  return database.$transaction(async tx => {
    // Serialize concurrent bootstrap attempts, including attempts with different emails.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(7684202608::bigint)`;
    if (await tx.user.findFirst({ where: { OR: [{ role: "ADMIN" }, { email: parsed.data.email }] }, select: { id: true } })) {
      throw new Error("Initial administrator already exists or email is already in use; no credentials changed.");
    }
    // Official signup API owns hashing and credential linking. This instance is never mounted.
    const localAuth = betterAuth({
      ...auth.options,
      database: prismaAdapter(tx, { provider: "postgresql", transaction: false }),
      emailAndPassword: { ...auth.options.emailAndPassword, enabled: true, disableSignUp: false, autoSignIn: false },
    });
    const result = await localAuth.api.signUpEmail({ body: parsed.data });
    return tx.user.update({ where: { id: result.user.id }, data: { role: "ADMIN" }, select: { id: true } });
  }, { timeout: 30000 });
}

// Never mount this tooling function on an HTTP endpoint. The CLI accepts only
// the approved development target; the test target is available solely to tests.
export async function provisionLocalTestUser(
  database: ReturnType<typeof createDatabaseClient>,
  env: Record<string, string | undefined>,
  input: { email: string; name: string; password: string; role: "VIEWER" | "COORDINATOR" },
  target: "development" | "test" = "development",
) {
  const { assertLocalTarget, readDatabaseUrl } = await import("../database/environment");
  if (env.NODE_ENV === "production" || (target === "test" && env.NODE_ENV !== "test")) throw new Error("Local test-user provisioning is unavailable.");
  assertLocalTarget(readDatabaseUrl(env), target);
  const parsed = inputSchema.extend({ role: z.enum(["VIEWER", "COORDINATOR"]) }).safeParse(input);
  if (!parsed.success) throw new Error("Use VIEWER or COORDINATOR, valid name/email, and a password of 12–128 characters.");
  const auth = createAuth(database, env);
  return database.$transaction(async tx => {
    const identity = await tx.$queryRaw<{ database: string; username: string }[]>`SELECT current_database() AS database, current_user AS username`;
    const expected = target === "test" ? "liminal_test" : "liminal_dev";
    if (identity[0]?.database !== expected || identity[0]?.username !== expected) throw new Error("Unapproved live database identity.");
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(7684202608::bigint)`;
    if (await tx.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })) throw new Error("Email already exists; no credentials changed.");
    const localAuth = betterAuth({ ...auth.options, database: prismaAdapter(tx, { provider: "postgresql", transaction: false }), emailAndPassword: { ...auth.options.emailAndPassword, disableSignUp: false, autoSignIn: false } });
    const { role, ...body } = parsed.data;
    const result = await localAuth.api.signUpEmail({ body });
    return tx.user.update({ where: { id: result.user.id }, data: { role }, select: { id: true } });
  }, { timeout: 30000 });
}
