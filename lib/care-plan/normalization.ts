export type EvidenceFragment = {
  pageNumber: number;
  sourceId: string;
  text: string;
  readingOrder: number;
};

export function splitSemicolonItems(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinContiguousPageFragments(first: EvidenceFragment, second: EvidenceFragment) {
  const adjacentPages = second.pageNumber === first.pageNumber + 1;
  const contiguousOrder = first.readingOrder === Number.MAX_SAFE_INTEGER && second.readingOrder === 0;
  const appearsIncomplete = !/[.!?]$/.test(first.text.trim());
  if (!adjacentPages || !contiguousOrder || !appearsIncomplete) return null;
  return {
    text: `${first.text.trim()} ${second.text.trim()}`,
    sourceIds: [first.sourceId, second.sourceId],
    confidence: "medium" as const,
  };
}

export type ComparableInstruction = {
  id: string;
  identity: string;
  action: string;
  value: string;
  sourceIds: string[];
};

export function reconcileInstructions(items: ComparableInstruction[]) {
  const displayed: ComparableInstruction[] = [];
  const conflicts: Array<{ identity: string; itemIds: string[]; sourceIds: string[] }> = [];
  for (const item of items) {
    const existing = displayed.find((candidate) => candidate.identity === item.identity);
    if (!existing) {
      displayed.push({ ...item, sourceIds: [...item.sourceIds] });
      continue;
    }
    if (existing.action === item.action && existing.value === item.value) {
      existing.sourceIds = Array.from(new Set([...existing.sourceIds, ...item.sourceIds]));
    } else {
      conflicts.push({
        identity: item.identity,
        itemIds: [existing.id, item.id],
        sourceIds: Array.from(new Set([...existing.sourceIds, ...item.sourceIds])),
      });
    }
  }
  return { displayed, conflicts };
}
