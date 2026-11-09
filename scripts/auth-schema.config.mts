// Schema generation ONLY. Never imported by src/app or mounted as an HTTP handler.
import { betterAuth } from "better-auth";
import { authUserFields } from "../src/server/auth/fields.ts";

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  emailAndPassword: { enabled: true, disableSignUp: true },
  advanced: { database: { generateId: "uuid" } },
  user: { additionalFields: authUserFields },
});
