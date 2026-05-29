import {
  clickStation as clickStationOnBrowser,
  getArgentinaStations,
  getStationsNear,
  getStationsByCountry,
} from "../providers/radioBrowser";

import { reverseGeocode } from "../providers/nominatim";

import {
  hasValidStream,
  isBuenosAiresStation,
  isWithinAntennaRange,
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
    .sort(sortByBandAndFrequency);
}

export async function getBuenosAiresStations(
  userLat?: number,
  userLng?: number
): Promise<RadioStation[]> {
  const raw = await getArgentinaStations();
  const stations = buildStationList(raw.filter(isBuenosAiresStation));

  if (userLat !== undefined && userLng !== undefined) {
    return stations.filter((s) => isWithinAntennaRange(s, userLat, userLng));
  }

  return stations;
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

export async function registerClick(uuid: string): Promise<void> {
  await clickStationOnBrowser(uuid);
}
