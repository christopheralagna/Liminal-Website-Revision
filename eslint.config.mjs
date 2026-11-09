import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // Historical source archives are reference material, not application code.
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts", "references/**", "src/generated/**"]),
]);
