import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isSourceControlledSyntheticFixture, syntheticCacheFilename } from "@/lib/ai/cache-policy";
import { CarePlanSchema, type CarePlan } from "@/lib/schema/care-plan";

const CACHE_DIR = path.join(process.cwd(), ".clearcare", "synthetic-cache");
const FIXTURE_PATH = path.join(process.cwd(), "public", "samples", "clearcare-comprehensive-sample.pdf");

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function committedFixtureHash() {
  try {
    return sha256(await readFile(FIXTURE_PATH));
  } catch {
    return null;
  }
}

async function cachePath(documentHash: string, model: string) {
  const fixtureHash = await committedFixtureHash();
  if (!fixtureHash || !isSourceControlledSyntheticFixture(documentHash, fixtureHash)) return null;
  return path.join(CACHE_DIR, syntheticCacheFilename(documentHash, model));
}

export async function readSyntheticCarePlanCache(documentHash: string, model: string): Promise<CarePlan | null> {
  const target = await cachePath(documentHash, model);
  if (!target) return null;
  try {
    const cached = CarePlanSchema.parse(JSON.parse(await readFile(target, "utf8")));
    if (!cached.documentMetadata.synthetic || cached.analysisMetadata.model !== model || !cached.analysisMetadata.liveApiUsed) return null;
    return cached;
  } catch {
    return null;
  }
}

export async function writeSyntheticCarePlanCache(documentHash: string, model: string, carePlan: CarePlan) {
  const target = await cachePath(documentHash, model);
  if (!target || !carePlan.documentMetadata.synthetic || !carePlan.analysisMetadata.liveApiUsed) return false;
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(target, `${JSON.stringify(carePlan)}\n`, { encoding: "utf8", mode: 0o600 });
  return true;
}
