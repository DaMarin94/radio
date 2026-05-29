import {
  RadioBrowserStation,
  RadioStation,
  ReverseGeocodeResult,
} from "../models/radioStation";
import { getDistanceKm } from "../utils/radioUtils";

// AR-B = Buenos Aires province, AR-C = CABA
const BA_ISO_CODES = new Set(["AR-B", "AR-C"]);

export function isBuenosAiresStation(
  station: RadioBrowserStation
): boolean {
  if (station.iso_3166_2) {
    return BA_ISO_CODES.has(station.iso_3166_2);
  }

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
  return Boolean(station.name && station.url_resolved) && station.lastcheckok !== 0;
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

const ANTENNA_RANGE_KM: Record<"AM" | "FM", number> = { FM: 50, AM: 500 };

export function isWithinAntennaRange(
  station: RadioStation,
  userLat: number,
  userLng: number
): boolean {
  if (station.lat === null || station.lng === null) return true;
  if (station.band === null) return true;
  const distance = getDistanceKm(userLat, userLng, station.lat, station.lng);
  return distance <= ANTENNA_RANGE_KM[station.band];
}

export function stationMatchesLocation(
  station: RadioStation,
  location: ReverseGeocodeResult
): boolean {
  if (!station.state) return false;

  const ss = normalize(station.state);
  const city = normalize(location.city);
  const state = normalize(location.state);

  return (
    ss.includes(city) ||
    city.includes(ss) ||
    ss.includes(state) ||
    state.includes(ss)
  );
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
