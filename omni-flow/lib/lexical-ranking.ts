const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = ALPHABET.length;

function charToIndex(char: string): number {
  const idx = ALPHABET.indexOf(char);
  if (idx === -1) {
    throw new Error(`Invalid rank character: ${char}`);
  }
  return idx;
}

function indexToChar(index: number): string {
  return ALPHABET[index];
}

/**
 * Generates a lexical rank between prevRank and nextRank.
 *
 * Rules:
 * - null prevRank => insert at beginning
 * - null nextRank => insert at end
 * - both null => first item
 */
export function generateLexicalRank(
  prevRank: string | null,
  nextRank: string | null,
): string {
  // Empty board
  if (prevRank == null && nextRank == null) {
    return "U";
  }

  // Insert at top
  if (prevRank == null) {
    return midpoint("", nextRank!);
  }

  // Insert at bottom
  if (nextRank == null) {
    return increment(prevRank);
  }

  if (prevRank >= nextRank) {
    throw new Error(
      `Invalid rank range: prevRank (${prevRank}) must be < nextRank (${nextRank})`,
    );
  }

  return midpoint(prevRank, nextRank);
}

function midpoint(a: string, b: string): string {
  let result = "";

  let i = 0;

  while (true) {
    const aDigit = i < a.length ? charToIndex(a[i]) : 0;

    const bDigit = i < b.length ? charToIndex(b[i]) : BASE - 1;

    if (bDigit - aDigit > 1) {
      const mid = Math.floor((aDigit + bDigit) / 2);
      return result + indexToChar(mid);
    }

    result += indexToChar(aDigit);
    i++;
  }
}

function increment(rank: string): string {
  if (rank.length === 0) {
    return "U";
  }

  const chars = rank.split("");

  for (let i = chars.length - 1; i >= 0; i--) {
    const idx = charToIndex(chars[i]);

    if (idx < BASE - 1) {
      chars[i] = indexToChar(idx + 1);

      return chars.slice(0, i + 1).join("");
    }
  }

  return rank + "U";
}
