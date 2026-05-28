import {
  getArgentinaStations,
  getStationsNear,
  getStationsByCountry,
} from "../providers/radioBrowser";

import { reverseGeocode } from "../providers/nominatim";

import {
  hasValidStream,
  isBuenosAiresStation,
  removeDuplicateStations,
  stationMatchesLocation,
} from "../filters/radioFilters";

import { mapRadioStation } from "../mappers/radioMapper";
import { sortByBandAndFrequency } from "../sorters/radioSorters";
import { RadioBrowserStation, RadioStation, ReverseGeocodeResult } from "../models/radioStation";

export type StationsByLocationResult = {
  location: ReverseGeocodeResult;
  stations: RadioStation[];
};

function hasFrequency(station: RadioStation): boolean {
  return station.frequency !== null && station.band !== null;
}

function buildStationList(raw: RadioBrowserStation[]): RadioStation[] {
  return raw
    .filter(hasValidStream)
    .map(mapRadioStation)
    .filter(hasFrequency)
    .filter(removeDuplicateStations)
    .sort(sortByBandAndFrequency);
}

export async function getBuenosAiresStations(): Promise<RadioStation[]> {
  const raw = await getArgentinaStations();
  return buildStationList(raw.filter(isBuenosAiresStation));
}

export async function getNearbyStations(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<RadioStation[]> {
  const raw = await getStationsNear(lat, lng, radiusKm);
  return buildStationList(raw);
}

export async function getStationsByLocation(
  lat: number,
  lng: number
): Promise<StationsByLocationResult> {
  const location = await reverseGeocode(lat, lng);

  if (!location) {
    throw new Error("Could not determine location from coordinates");
  }

  const raw = await getStationsByCountry(location.countrycode);
  const all = buildStationList(raw);

  const local = all.filter((station) =>
    stationMatchesLocation(station, location)
  );

  // If very few local results, return all country stations as fallback
  const stations = local.length >= 3 ? local : all;

  return { location, stations };
}
