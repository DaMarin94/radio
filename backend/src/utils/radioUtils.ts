export function extractFrequency(
  name: string
): string | null {
  const match = name.match(/(\d{2,4}(?:\.\d)?)/);

  return match ? match[1]! : null;
}

export function detectBand(
  name: string
): "AM" | "FM" | null {
  const upper = name.toUpperCase();

  if (upper.includes("AM")) return "AM";
  if (upper.includes("FM")) return "FM";

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