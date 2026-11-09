import { Client } from "pg";
import { assertLocalTarget, type DatabaseTarget } from "../src/server/database/environment";

export async function verifyTarget(url: string, target: DatabaseTarget) {
  if (process.env.NODE_ENV === "production") throw new Error("Local database tooling is disabled in production.");
  assertLocalTarget(url, target);
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const { rows } = await client.query("SELECT current_database() AS database, current_user AS username");
    const name = target === "test" ? "liminal_test" : "liminal_dev";
    if (rows[0]?.database !== name || rows[0]?.username !== name) throw new Error("Database identity mismatch.");
  } finally { await client.end(); }
}
