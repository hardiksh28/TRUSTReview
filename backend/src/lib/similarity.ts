function trigrams(text: string): Set<string> {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const padded = `  ${normalized} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

/**
 * Sorensen-Dice coefficient over character trigrams. Returns a value in
 * [0, 1], where 1 means identical text. Cheap, dependency-free, good enough
 * to catch copy-pasted or near-identical review text.
 */
export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const aGrams = trigrams(a);
  const bGrams = trigrams(b);
  if (aGrams.size === 0 || bGrams.size === 0) return 0;

  let intersection = 0;
  for (const g of aGrams) {
    if (bGrams.has(g)) intersection++;
  }
  return (2 * intersection) / (aGrams.size + bGrams.size);
}
