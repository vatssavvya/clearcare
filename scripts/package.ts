import { createWriteStream } from "node:fs";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";
import { shouldPackage } from "../lib/release/package-policy";
import { scanTree } from "./secret-check";

const root = process.cwd();
const artifacts = path.join(root, "artifacts");
const stagingRoot = path.join(artifacts, "package-staging");
const stagingProject = path.join(stagingRoot, "clearcare");
const outputPath = path.join(artifacts, "clearcare-hackathon-submission.zip");

function assertInsideWorkspace(target: string) {
  const relative = path.relative(root, path.resolve(target));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Refusing unsafe package path: ${target}`);
}

assertInsideWorkspace(stagingRoot);
assertInsideWorkspace(outputPath);
await rm(stagingRoot, { recursive: true, force: true });
await mkdir(stagingProject, { recursive: true });

async function copyDirectory(source: string, destination: string, relativeBase = "") {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const relative = path.join(relativeBase, entry.name);
    if (!shouldPackage(relative)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyDirectory(from, to, relative);
    } else if (entry.isFile()) {
      await cp(from, to, { force: true });
    }
  }
}

await copyDirectory(root, stagingProject);
const findings = await scanTree(stagingProject, { rejectProhibitedFilenames: true });
if (findings.length > 0) {
  throw new Error(`Secret scan rejected package staging: ${findings.map((item) => `${item.path} (${item.rule})`).join(", ")}`);
}

await mkdir(artifacts, { recursive: true });
await new Promise<void>((resolve, reject) => {
  const output = createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  output.on("close", resolve);
  output.on("error", reject);
  archive.on("error", reject);
  archive.pipe(output);
  archive.directory(stagingProject, "clearcare");
  void archive.finalize();
});

console.log(`Created ${outputPath}`);
