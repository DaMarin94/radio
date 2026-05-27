import type { RadioStation } from "../types/radioStation";

export type TuningMode = "CONTINUOUS" | "SNAP";

export function resolveStationByTuning(
  value: number,
  stations: RadioStation[],
  mode: TuningMode
): RadioStation | null {
  const withFreq = stations.filter(
    (s) => s.frequency
  );

  if (withFreq.length === 0) return null;

  if (mode === "CONTINUOUS") {
    return withFreq.reduce((closest, current) => {
      const v = parseFloat(current.frequency!);
      const c = parseFloat(closest.frequency!);

      return Math.abs(v - value) <
        Math.abs(c - value)
        ? current
        : closest;
    });
  }

  // SNAP MODE
  return withFreq.reduce((closest, current) => {
    const v = parseFloat(current.frequency!);
    const c = parseFloat(closest.frequency!);

    return Math.abs(v - value) <
      Math.abs(c - value)
      ? current
      : closest;
  });
}
