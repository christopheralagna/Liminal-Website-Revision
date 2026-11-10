import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { stdin, stdout } from "node:process";
import { createDatabaseClient } from "../src/server/database/client";
import { readDatabaseUrl } from "../src/server/database/environment";
import { provisionLocalTestUser } from "../src/server/auth/provision";
import { verifyTarget } from "./database-target";

async function main() {
  if (!stdin.isTTY || !stdout.isTTY || process.argv.length !== 2) throw new Error("Run interactively without arguments.");
  const url = readDatabaseUrl(process.env);
  await verifyTarget(url, "development");
  const database = createDatabaseClient(url);
  let muted = false;
  const output = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk, encoding); callback(); } });
  const prompt = createInterface({ input: stdin, output, terminal: true });
  try {
    const role = (await prompt.question("Test role (VIEWER or COORDINATOR): ")).trim().toUpperCase();
    if (role !== "VIEWER" && role !== "COORDINATOR") throw new Error("Choose VIEWER or COORDINATOR.");
    const name = await prompt.question("Test account name: ");
    const email = await prompt.question("Test account email: ");
    stdout.write("Password (12–128 characters, hidden): ");
    muted = true;
    const password = await prompt.question("");
    muted = false;
    stdout.write("\nConfirm password (hidden): ");
    muted = true;
    const confirmation = await prompt.question("");
    muted = false;
    stdout.write("\n");
    if (password !== confirmation) throw new Error("Passwords do not match.");
    await provisionLocalTestUser(database, process.env, { name, email: email.trim().toLowerCase(), password, role });
    stdout.write("Local test account created. No session was issued.\n");
  } finally { muted = false; prompt.close(); await database.$disconnect(); }
}
main().catch(() => {
  // Never print raw library/adapter/input errors.
  console.error("Test-account provisioning failed. Check the approved local development configuration, input requirements, and whether that email already exists. No existing credentials were replaced.");
  process.exitCode = 1;
});
