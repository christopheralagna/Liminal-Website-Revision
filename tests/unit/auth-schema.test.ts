import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function fields(schema: string, name: string) {
  const body = schema.match(new RegExp(`model ${name} \\{([^}]+)\\}`))?.[1];
  if (!body) throw new Error(`Missing ${name}`);
  return Object.fromEntries(body.split("\n").map(line => line.trim().match(/^(\w+)\s+(\w+(?:\[\]|\?)?)/)).filter(match => match !== null).map(match => [match![1], match![2]]));
}

describe("pinned Better Auth schema contract (no authentication runtime)", () => {
  it("preserves the generated core fields, nullability and native UUID defaults", () => {
    const generated = readFileSync("docs/generated/better-auth-1.7.18.prisma", "utf8");
    const actual = readFileSync("prisma/schema.prisma", "utf8");
    for (const model of ["User", "Session", "Account", "Verification"]) {
      const expected = fields(generated, model);
      if (model === "User") expected.role = "AppRole";
      expect(fields(actual, model)).toMatchObject(expected);
      const body = actual.match(new RegExp(`model ${model} \\{([^}]+)\\}`))![1];
      expect(body).toContain('@default(dbgenerated("gen_random_uuid()")) @db.Uuid');
    }
  });
});
