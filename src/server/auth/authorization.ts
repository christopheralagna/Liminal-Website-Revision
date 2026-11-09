import "server-only";
import type { AppRole } from "../../generated/prisma/client";
import type { createDatabaseClient } from "../database/client";
import type { createAuth } from "./factory";

const permissions = {
  ADMIN: ["volunteers:read", "volunteers:write", "scheduling:read", "scheduling:write", "events:read", "events:write", "finances:read", "finances:write", "accounts:manage"],
  COORDINATOR: ["volunteers:read", "volunteers:write", "scheduling:read", "scheduling:write", "events:read", "events:write"],
  VIEWER: ["volunteers:read", "scheduling:read"],
} as const satisfies Record<AppRole, readonly string[]>;
export type Permission = typeof permissions.ADMIN[number];
export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403) { super(status === 401 ? "Authentication required" : "Access denied"); }
}

export function createAuthorization(auth: ReturnType<typeof createAuth>, database: ReturnType<typeof createDatabaseClient>) {
  async function requireUser(headers: Headers) {
    const session = await auth.api.getSession({ headers });
    if (!session) throw new AuthorizationError(401);
    // Never cache this read: a valid session does not imply current privileges.
    const user = await database.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, isActive: true } });
    if (!user?.isActive) throw new AuthorizationError(403);
    return user;
  }
  return {
    requireUser,
    async requireRole(role: AppRole, headers: Headers) {
      const user = await requireUser(headers);
      if (user.role !== role) throw new AuthorizationError(403);
      return user;
    },
    async requirePermission(permission: Permission, headers: Headers) {
      const user = await requireUser(headers);
      if (!(permissions[user.role] as readonly string[]).includes(permission)) throw new AuthorizationError(403);
      return user;
    },
  };
}
