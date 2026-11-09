// Schema generation ONLY. Never imported by src/app or mounted as an HTTP handler.
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  emailAndPassword: { enabled: true, disableSignUp: true },
  advanced: { database: { generateId: "uuid" } },
  user: {
    additionalFields: {
      role: { type: ["ADMIN", "COORDINATOR", "VIEWER"], defaultValue: "VIEWER", input: false },
      isActive: { type: "boolean", defaultValue: true, input: false },
    },
  },
});
