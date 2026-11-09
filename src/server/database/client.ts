import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Shared factory for server use and local tooling; no connection until first query.
export function createDatabaseClient(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }) });
}
