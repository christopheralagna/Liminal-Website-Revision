import "server-only";
import { headers } from "next/headers";
import type { AppRole } from "../../generated/prisma/client";
import { getAuth } from "./index";
import { getDatabase } from "../db";
import { createAuthorization, type Permission } from "./authorization";

export async function requirePermission(permission: Permission) {
  return createAuthorization(getAuth(), getDatabase()).requirePermission(permission, await headers());
}
export async function requireRole(role: AppRole) {
  return createAuthorization(getAuth(), getDatabase()).requireRole(role, await headers());
}
export async function requireUser() {
  return createAuthorization(getAuth(), getDatabase()).requireUser(await headers());
}
