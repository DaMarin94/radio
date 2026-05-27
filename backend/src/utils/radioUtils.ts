export function extractFrequency(
  name: string
): string | null {
  const match = name.match(/(\d{2,4}(?:\.\d)?)/);

  return match ? match[1] : null;
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