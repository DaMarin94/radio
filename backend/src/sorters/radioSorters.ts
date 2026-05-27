import { RadioStation } from "../models/radioStation";

function getBandPriority(
  band: "AM" | "FM" | null
): number {
  if (band === "AM") return 0;
  if (band === "FM") return 1;

  return 2;
}

function getFrequencyValue(
  frequency: string | null
): number {
  if (!frequency) return Number.MAX_SAFE_INTEGER;

  return parseFloat(frequency);
}

export function sortByBandAndFrequency(
  a: RadioStation,
  b: RadioStation
): number {
  const bandDiff =
    getBandPriority(a.band) -
    getBandPriority(b.band);

  if (bandDiff !== 0) {
    return bandDiff;
  }

  return (
    getFrequencyValue(a.frequency) -
    getFrequencyValue(b.frequency)
  );
}