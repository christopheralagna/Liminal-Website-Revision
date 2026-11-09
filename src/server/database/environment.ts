import { z } from "zod";

const databaseUrl = z.string().url().refine((value) => {
  const url = new URL(value);
  return ["postgres:", "postgresql:"].includes(url.protocol) && !!url.hostname && url.pathname.length > 1;
});

export function readDatabaseUrl(env: Record<string, string | undefined>, variable = "DATABASE_URL"): string {
  const result = databaseUrl.safeParse(env[variable]);
  if (!result.success) throw new Error(`${variable} must be a PostgreSQL connection URL.`);
  return result.data;
}

export type DatabaseTarget = "development" | "test";

// CLI/seed/test mutations are restricted to this project's explicit local targets.
// Production read/write application configuration is separate from these tooling guards.
export function assertLocalTarget(value: string, target: DatabaseTarget): void {
  const result = databaseUrl.safeParse(value);
  if (!result.success) throw new Error("Invalid database target.");
  const url = new URL(result.data);
  const name = target === "test" ? "liminal_test" : "liminal_dev";
  const port = target === "test" ? "5435" : "5434";
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.port !== port || url.pathname !== `/${name}` || decodeURIComponent(url.username) !== name ||
    Array.from(url.searchParams).some(([key, value]) => key !== "schema" || value !== "public")
  ) throw new Error(`Refusing an unapproved ${target} database target.`);
}
