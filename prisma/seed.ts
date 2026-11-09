import "dotenv/config";
import { createDatabaseClient } from "../src/server/database/client";
import { readDatabaseUrl } from "../src/server/database/environment";
import { verifyTarget } from "../scripts/database-target";
import { seedDemonstrationData } from "./seed-data";

async function main() {
  const url = readDatabaseUrl(process.env);
  await verifyTarget(url, "development");
  const database = createDatabaseClient(url);
  try { await seedDemonstrationData(database); console.log("Synthetic demonstration fixtures created; existing records were preserved."); }
  finally { await database.$disconnect(); }
}
main().catch(() => { console.error("Seed failed. Verify the approved local database and migrated schema; no reset or deletion was attempted."); process.exitCode = 1; });
