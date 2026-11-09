import { describe, expect, it } from "vitest";
import { assertLocalTarget, readDatabaseUrl } from "../../src/server/database/environment";

const dev = "postgresql://liminal_dev:secret@127.0.0.1:5434/liminal_dev";
const test = "postgresql://liminal_test:secret@127.0.0.1:5435/liminal_test";
describe("database configuration and mutation boundaries", () => {
  it("validates lazily and never includes credentials in errors", () => {
    expect(readDatabaseUrl({ DATABASE_URL: dev })).toBe(dev);
    expect(() => readDatabaseUrl({})).toThrow("DATABASE_URL must be a PostgreSQL connection URL.");
    expect(() => readDatabaseUrl({ DATABASE_URL: "https://secret@example.com" })).toThrow("DATABASE_URL must be a PostgreSQL connection URL.");
  });
  it("accepts separate approved local identities", () => {
    expect(() => assertLocalTarget(dev, "development")).not.toThrow();
    expect(() => assertLocalTarget(test, "test")).not.toThrow();
  });
  it.each([
    dev, test.replace("127.0.0.1", "db.example.com"), test.replace("5435", "5432"),
    test.replace("/liminal_test", "/production"), test + "?schema=private", test.replace("liminal_test:secret", "postgres:secret"),
  ])("refuses a test write to an unapproved target", (url) => {
    expect(() => assertLocalTarget(url, "test")).toThrow();
  });
});
