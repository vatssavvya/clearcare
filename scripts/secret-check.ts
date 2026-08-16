import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isProhibitedSecretFilename, normalizePackagePath } from "../lib/release/package-policy";

const skippedDirectories = new Set([".git", ".next", ".clearcare", "node_modules", "artifacts", "tmp", "coverage", "test-results", "playwright-report"]);
const rules = [
  { name: "OpenAI-style API key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { name: "private key material", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "GitHub personal token", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
];

export type SecretFinding = { path: string; rule: string };

export async function scanTree(root: string, options: { rejectProhibitedFilenames?: boolean } = {}) {
  const findings: SecretFinding[] = [];

  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      const relative = normalizePackagePath(path.relative(root, absolute));
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      if (isProhibitedSecretFilename(relative)) {
        if (options.rejectProhibitedFilenames) findings.push({ path: relative, rule: "prohibited environment filename" });
        continue;
      }
      const bytes = await readFile(absolute);
      if (bytes.includes(0)) continue;
      const contents = bytes.toString("utf8");
      for (const rule of rules) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(contents)) findings.push({ path: relative, rule: rule.name });
      }
    }
  }

  await walk(path.resolve(root));
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  const findings = await scanTree(root, { rejectProhibitedFilenames: false });
  if (findings.length > 0) {
    for (const finding of findings) console.error(`${finding.path}: ${finding.rule}`);
    process.exitCode = 1;
  } else {
    console.log(`Secret scan passed for ${root}.`);
  }
}
