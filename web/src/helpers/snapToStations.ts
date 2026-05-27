import type { RadioStation } from "../types/radioStation";

export function snapToStations(
  value: number,
  stations: RadioStation[]
): RadioStation | null {
  const withFreq = stations.filter(
    (s) => s.frequency
  );

  if (withFreq.length === 0) return null;

  return withFreq.reduce((closest, current) => {
    const v = parseFloat(current.frequency!);
    const c = parseFloat(closest.frequency!);

    return Math.abs(v - value) <
      Math.abs(c - value)
      ? current
      : closest;
  });
}