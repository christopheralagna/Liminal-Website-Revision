import "server-only";
import { createDatabaseClient } from "./database/client";
import { readDatabaseUrl } from "./database/environment";

const globalDatabase = globalThis as unknown as { liminalDatabase?: ReturnType<typeof createDatabaseClient> };

let productionDatabase: ReturnType<typeof createDatabaseClient> | undefined;

// Lazy so public static pages and builds do not require an administrative database.
export function getDatabase() {
  const database = globalDatabase.liminalDatabase ?? (productionDatabase ??= createDatabaseClient(readDatabaseUrl(process.env)));
  if (process.env.NODE_ENV !== "production") globalDatabase.liminalDatabase = database;
  return database;
}
