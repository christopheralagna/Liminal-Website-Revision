import "server-only";
import { getDatabase } from "../db";
import { createAuth, createAuthHandler } from "./factory";

let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return instance ??= createAuth(getDatabase(), process.env);
}
export async function handleAuthRequest(request: Request) {
  return createAuthHandler(getAuth())(request);
}
