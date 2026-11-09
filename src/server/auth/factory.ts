import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { createDatabaseClient } from "../database/client";
import { readAuthEnvironment } from "./environment";
import { authUserFields } from "./fields";

type Database = ReturnType<typeof createDatabaseClient>;

export function createAuth(database: Database, env: Record<string, string | undefined>) {
  const config = readAuthEnvironment(env);
  return betterAuth({
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: [config.baseURL],
    database: prismaAdapter(database, { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12, maxPasswordLength: 128 },
    user: { additionalFields: authUserFields },
    session: { expiresIn: 60 * 60 * 8, disableSessionRefresh: true, cookieCache: { enabled: false } },
    advanced: {
      disableOriginCheck: false,
      disableCSRFCheck: false,
      database: { generateId: "uuid" },
      useSecureCookies: config.secureCookies,
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: config.secureCookies },
      // This header must be overwritten by a trusted ingress before production use.
      ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
    },
    rateLimit: { enabled: true, storage: "memory", window: 60, max: 100,
      customRules: { "/sign-in/email": { window: 60, max: 5 } } },
    logger: { disabled: true }, // Never serialize adapter errors or credential-bearing request data.
    databaseHooks: {
      session: { create: { before: async (session) => {
        const user = await database.user.findUnique({ where: { id: session.userId }, select: { isActive: true } });
        if (!user?.isActive) throw new APIError("UNAUTHORIZED", { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" });
      } } },
    },
    hooks: { after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/get-session") {
        const result = ctx.context.returned as { user?: { id: string } } | null;
        if (result?.user) {
          const user = await database.user.findUnique({ where: { id: result.user.id }, select: { isActive: true } });
          if (!user?.isActive) return ctx.json(null);
        }
      }
    }) },
  });
}

// Stage C intentionally exposes only login, session lookup, and logout.
// Signup remains disabled in Better Auth itself, including direct server API calls.
export function createAuthHandler(auth: ReturnType<typeof createAuth>) {
  return async (request: Request) => {
    const path = new URL(request.url).pathname;
    if (!((request.method === "POST" && ["/api/auth/sign-in/email", "/api/auth/sign-out", "/api/auth/sign-up/email"].includes(path)) ||
          (request.method === "GET" && path === "/api/auth/get-session"))) {
      return Response.json({ message: "Not found" }, { status: 404 });
    }
    const response = await auth.handler(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  };
}
