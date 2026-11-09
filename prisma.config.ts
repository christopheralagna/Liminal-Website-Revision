import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Generation/validation work without database credentials; connection commands use guarded scripts.
  datasource: { url: process.env.DATABASE_URL ?? "postgresql://unused:unused@127.0.0.1:5434/liminal_dev" },
});
