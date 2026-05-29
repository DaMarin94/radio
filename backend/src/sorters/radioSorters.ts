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

  const freqDiff =
    getFrequencyValue(a.frequency) -
    getFrequencyValue(b.frequency);

  if (freqDiff !== 0) {
    return freqDiff;
  }

  // Same frequency: prefer the more voted station, then the more clicked
  const voteDiff = (b.votes ?? 0) - (a.votes ?? 0);
  if (voteDiff !== 0) return voteDiff;

  return (b.clickcount ?? 0) - (a.clickcount ?? 0);
}