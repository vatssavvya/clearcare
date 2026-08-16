const includedTopLevelFiles = new Set([
  ".env.example",
  "README.md",
  "LICENSE",
  "FINAL_HANDOFF.md",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "next-env.d.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "eslint.config.mjs",
  "vitest.config.ts",
  "playwright.config.ts",
]);

const includedTopLevelDirectories = new Set(["app", "components", "lib", "public", "scripts", "tests", "docs"]);

const prohibitedNames = new Set([".env", ".env.local", ".env.production", ".env.development", ".env.test"]);

export function normalizePackagePath(value: string) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function shouldPackage(relativePath: string) {
  const normalized = normalizePackagePath(relativePath);
  const parts = normalized.split("/");
  const topLevel = parts[0] ?? "";
  const basename = parts.at(-1) ?? "";
  if (!normalized) return false;
  if (parts.length === 1 && !includedTopLevelFiles.has(topLevel) && !includedTopLevelDirectories.has(topLevel)) return false;
  if (parts.length > 1 && !includedTopLevelDirectories.has(topLevel)) return false;
  if (prohibitedNames.has(basename) || basename.endsWith(".tsbuildinfo") || basename.endsWith(".log")) return false;
  return true;
}

export function isProhibitedSecretFilename(relativePath: string) {
  return prohibitedNames.has(normalizePackagePath(relativePath).split("/").at(-1) ?? "");
}
