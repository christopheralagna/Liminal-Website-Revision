import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { stdin, stdout } from "node:process";
import { createDatabaseClient } from "../src/server/database/client";
import { readDatabaseUrl } from "../src/server/database/environment";
import { provisionInitialAdmin } from "../src/server/auth/provision";
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
    const name = await prompt.question("Administrator name: ");
    const email = await prompt.question("Administrator email: ");
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
    await provisionInitialAdmin(database, process.env, { name, email: email.trim().toLowerCase(), password });
    stdout.write("Initial administrator created. No session was issued.\n");
  } finally { muted = false; prompt.close(); await database.$disconnect(); }
}
main().catch(() => {
  // Never print raw library/adapter/input errors.
  console.error("Administrator provisioning failed. Check local configuration, input requirements, and whether an administrator or that email already exists. No existing credentials were replaced.");
  process.exitCode = 1;
});
