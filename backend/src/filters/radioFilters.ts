import {
  RadioBrowserStation,
  RadioStation,
} from "../models/radioStation";

export function isBuenosAiresStation(
  station: RadioBrowserStation
): boolean {
  const state = station.state?.toLowerCase() || "";

  return state.includes("buenos aires");
}

export function hasValidStream(
  station: RadioBrowserStation
): boolean {
  return Boolean(
    station.name &&
      station.url_resolved
  );
}

export function removeDuplicateStations(
  station: RadioStation,
  index: number,
  self: RadioStation[]
): boolean {
  return (
    index ===
    self.findIndex(
      (s) => s.name === station.name
    )
  );
}