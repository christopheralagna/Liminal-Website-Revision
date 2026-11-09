import "dotenv/config";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { readDatabaseUrl } from "../src/server/database/environment";
import { verifyTarget } from "./database-target";

async function main() {
  const [command, target] = process.argv.slice(2);
  if (!["migrate", "status"].includes(command) || !["development", "test"].includes(target)) {
    throw new Error("Use database.ts migrate|status development|test.");
  }
  const kind = target as "development" | "test";
  const url = readDatabaseUrl(process.env, kind === "test" ? "TEST_DATABASE_URL" : "DATABASE_URL");
  await verifyTarget(url, kind);
  // migrate deploy never resets a database or generates a destructive migration interactively.
  const result = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", command === "migrate" ? "deploy" : "status", "--config", "prisma.config.ts"], {
    stdio: "inherit", env: { ...process.env, DATABASE_URL: url },
  });
  if (result.error || result.status !== 0) throw new Error("Prisma migration command failed; no reset attempted.");
}
main().catch(() => { console.error("Database command failed. Check the local target, credentials and migration state; no reset was performed."); process.exitCode = 1; });
