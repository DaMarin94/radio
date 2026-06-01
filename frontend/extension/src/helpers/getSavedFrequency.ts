const DEFAULT_FREQUENCIES = {
  AM: 710,
  FM: 102.3,
} as const;

export function getSavedFrequency(band: "AM" | "FM"): number {
  const saved = localStorage.getItem(`frequency-${band}`);
  return saved ? Number(saved) : DEFAULT_FREQUENCIES[band];
}
