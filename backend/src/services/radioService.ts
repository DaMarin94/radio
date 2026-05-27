import {
  getArgentinaStations,
  getStationsNear,
  getStationsByCountry,
} from "../providers/radioBrowser";

import {
  reverseGeocode,
  ReverseGeocodeResult,
} from "../providers/nominatim";

import {
  hasValidStream,
  isBuenosAiresStation,
  removeDuplicateStations,
} from "../filters/radioFilters";

import { mapRadioStation } from "../mappers/radioMapper";

import { sortByBandAndFrequency } from "../sorters/radioSorters";

import { RadioStation } from "../models/radioStation";

export async function getBuenosAiresStations(): Promise<RadioStation[]> {
  const stations = await getArgentinaStations();

  return stations
    .filter(isBuenosAiresStation)
    .filter(hasValidStream)
    .map(mapRadioStation)
    .filter(removeDuplicateStations)
    .sort(sortByBandAndFrequency);
}

export async function getNearbyStations(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<RadioStation[]> {
  const stations = await getStationsNear(lat, lng, radiusKm);

  return stations
    .filter(hasValidStream)
    .map(mapRadioStation)
    .filter(removeDuplicateStations)
    .sort(sortByBandAndFrequency);
}

export type StationsByLocationResult = {
  location: ReverseGeocodeResult;
  stations: RadioStation[];
};

export async function getStationsByLocation(
  lat: number,
  lng: number
): Promise<StationsByLocationResult> {
  const location = await reverseGeocode(lat, lng);

  if (!location) {
    throw new Error("Could not determine location from coordinates");
  }

  const raw = await getStationsByCountry(location.countrycode);

  const all: RadioStation[] = raw
    .filter(hasValidStream)
    .map(mapRadioStation)
    .filter(removeDuplicateStations)
    .sort(sortByBandAndFrequency);

  const local = all.filter((station) =>
    stationMatchesLocation(station, location)
  );

  // If very few local results, return all country stations as fallback
  const stations = local.length >= 3 ? local : all;

  return { location, stations };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function stationMatchesLocation(
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
