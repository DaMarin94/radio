import {
  RadioStation,
  ReverseGeocodeResult,
} from "../models/radioStation";
import { getDistanceKm } from "../utils/radioUtils";

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
