import {
  RadioBrowserStation,
  RadioStation,
} from "../models/radioStation";
import { getDistanceKm } from "../utils/radioUtils";

export function isBuenosAiresStation(
  station: RadioBrowserStation
): boolean {
  const state = station.state?.toLowerCase() || "";

  // Include stations with no state — Radio Browser often lacks subdivision
  // data for valid BA stations (e.g. Blue 100.7, Aspen). Since we already
  // query by countrycode=AR, the risk of including non-BA stations is low.
  if (!state) return true;

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

export function filterNearby(
  stations: RadioStation[],
  userLat: number,
  userLng: number,
  radiusKm: number
): RadioStation[] {
  return stations.filter((station) => {
    if (!station.lat || !station.lng) return false;

    const distance = getDistanceKm(
      userLat,
      userLng,
      station.lat,
      station.lng
    );

    return distance <= radiusKm;
  });
}