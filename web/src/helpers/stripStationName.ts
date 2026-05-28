// Extracts the human name from patterns like "Rock And Pop FM 95.9 (Rock & Pop) Ciudad de Buenos Aires" → "Rock And Pop"
export function stripStationName(name: string): string {
  // Band-first wins to avoid matching numbers that are part of the name (e.g. "La 100 FM 100.1")
  let match = name.match(/\s*(?:FM|AM)\s*\d{2,4}(?:[.,]\d)?/i);

  if (!match || match.index === undefined) {
    match = name.match(/\s*\d{2,4}(?:[.,]\d)?\s*(?:FM|AM)/i);
  }

  if (!match || match.index === undefined) return name.trim();

  const left = name.slice(0, match.index).trim();
  if (left.length > 0) return left;

  // Band/freq at start: take the rest, stripping parentheticals
  const rest = name
    .slice(match.index + match[0].length)
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
  return rest || name.trim();
}
