import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname, "server-only": new URL("./tests/server-only.ts", import.meta.url).pathname } },
  test: { include: ["tests/integration/**/*.test.ts"], environment: "node", fileParallelism: false, testTimeout: 15000, hookTimeout: 30000 },
});
