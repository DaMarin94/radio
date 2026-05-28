export function formatDisplayName(name: string): string {
  const clean = name.trim().replace(/\s+/g, " ");

  const sanitize = (s: string) =>
    s
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/^[\s\-–—()/|.,]+|[\s\-–—()/|.,]+$/g, "")
      .trim();

  // Band-first pattern wins to avoid cutting names like "La 100 FM 100.1"
  let match = clean.match(/\s*(?:FM|AM)\s*\d{2,4}(?:[.,]\d)?/i);
  if (!match || match.index === undefined) {
    match = clean.match(/\s*\d{2,4}(?:[.,]\d)?\s*(?:FM|AM)/i);
  }

  let base: string;

  const stripDescriptor = (s: string) => sanitize(s.replace(/\s+[-–—]\s+.*$/, "")) || sanitize(s);

  if (match && match.index !== undefined) {
    const left = stripDescriptor(clean.slice(0, match.index));
    const right = stripDescriptor(clean.slice(match.index + match[0].length));
    base = left || right || stripDescriptor(clean) || clean;
  } else {
    const stripped = clean
      .replace(/\s+[-–—]\s+.*$/, "")
      .replace(/\b(?:FM|AM)\b/gi, " ")
      .replace(/\s+\d{2,4}(?:[.,]\d)?/g, "")
      .replace(/\s+/g, " ")
      .trim();
    base = sanitize(stripped) || sanitize(clean) || clean;
  }

  return base;
}

export function extractFrequency(
  name: string
): string {
  // Prefer frequency adjacent to FM/AM over any other number
  const adjacent =
    name.match(/(?:FM|AM)\s*(\d{2,4}(?:\.\d)?)/i) ??
    name.match(/(\d{2,4}(?:\.\d)?)\s*(?:FM|AM)/i);
  if (adjacent) return adjacent[1]!;

  const match = name.match(/(\d{2,4}(?:\.\d)?)/);
  return match ? (match[1] ? match[1] : '') : '';
}

export function detectBand(
  name: string
): "AM" | "FM" | null {
  const upper = name.toUpperCase();

  if (/\bFM\b/.test(upper)) return "FM";
  if (/\bAM\b/.test(upper)) return "AM";

  const frequency = extractFrequency(name);

  if (!frequency) return null;

  const freq = parseFloat(frequency);

  if (freq >= 76 && freq <= 108) return "FM";

  if (freq >= 500 && freq <= 1700) return "AM";

  return null;
}

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}