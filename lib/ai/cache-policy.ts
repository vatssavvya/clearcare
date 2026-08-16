import { createHash } from "node:crypto";

export function isSourceControlledSyntheticFixture(documentHash: string, committedFixtureHash: string) {
  return documentHash.length === 64 && documentHash === committedFixtureHash;
}

export function syntheticCacheFilename(documentHash: string, model: string) {
  const modelHash = createHash("sha256").update(model).digest("hex").slice(0, 16);
  return `${documentHash}-${modelHash}.json`;
}
