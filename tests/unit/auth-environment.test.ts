import { describe, expect, it } from "vitest";
import { readAuthEnvironment } from "../../src/server/auth/environment";
const env = { BETTER_AUTH_URL: "http://localhost:3000", BETTER_AUTH_SECRET: "synthetic-test-secret-with-at-least-32-characters" };
describe("authentication environment", () => {
  it("requires an explicit origin and secret", () => {
    expect(() => readAuthEnvironment({})).toThrow("BETTER_AUTH_SECRET");
    expect(() => readAuthEnvironment({ ...env, BETTER_AUTH_SECRET: "replace-with-at-least-32-random-characters" })).toThrow("BETTER_AUTH_SECRET");
    expect(() => readAuthEnvironment({ ...env, BETTER_AUTH_URL: undefined })).toThrow("BETTER_AUTH_URL");
    for (const url of ["ftp://localhost", "http://user:password@localhost", "http://localhost/path", "http://localhost?query=1"]) expect(() => readAuthEnvironment({ ...env, BETTER_AUTH_URL: url })).toThrow();
  });
  it("requires HTTPS in production and enables secure cookies for HTTPS", () => {
    expect(() => readAuthEnvironment({ ...env, NODE_ENV: "production" })).toThrow("HTTPS");
    expect(readAuthEnvironment({ ...env, NODE_ENV: "production", BETTER_AUTH_URL: "https://admin.example.invalid" }).secureCookies).toBe(true);
    expect(readAuthEnvironment(env).secureCookies).toBe(false);
  });
});
