const DEFAULT_FREQUENCIES = {
  AM: 710,
  FM: 90.3,
} as const;

export function getSavedFrequency(
  band: "AM" | "FM"
): number {
  const saved = localStorage.getItem(
    `frequency-${band}`
  );

  if (saved) {
    return Number(saved);
  }

  return DEFAULT_FREQUENCIES[band];
}
