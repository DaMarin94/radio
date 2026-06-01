import {
  clickStation as clickStationOnBrowser,
  getArgentinaStations,
  getStationsNear,
  getStationsByCountry,
} from "../providers/radioBrowser";

import { reverseGeocode } from "../providers/nominatim";
import { recognizeSong } from "../providers/audd";

import {
  isWithinAntennaRange,
  stationMatchesLocation,
} from "../filters/radioFilters";

import {
  hasValidStream,
  isBuenosAiresStation,
  mapRadioStation,
} from "../mappers/radioMapper";
import { sortByBandAndFrequency } from "../sorters/radioSorters";
import { RadioBrowserStation, RadioStation, ReverseGeocodeResult } from "../models/radioStation";
import { TTLCache } from "../utils/cache";

export type StationsByLocationResult = {
  location: ReverseGeocodeResult;
  stations: RadioStation[];
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const rawStationsCache = new TTLCache<RadioBrowserStation[]>(ONE_DAY_MS);
const processedBACache = new TTLCache<RadioStation[]>(ONE_DAY_MS);
const nowPlayingCache = new TTLCache<string | null>(60 * 1000);

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

async function getCachedArgentinaStations(): Promise<RadioBrowserStation[]> {
  return rawStationsCache.getOrFetch("AR", getArgentinaStations);
}

export async function getBuenosAiresStations(
  userLat?: number,
  userLng?: number
): Promise<RadioStation[]> {
  const stations = await processedBACache.getOrFetch("BA", async () => {
    const raw = await getCachedArgentinaStations();
    return buildStationList(raw.filter(isBuenosAiresStation));
  });

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

  const stations = local.length >= 3 ? local : all;

  return { location, stations };
}

export async function registerClick(uuid: string): Promise<void> {
  await clickStationOnBrowser(uuid);
}

export async function getNowPlaying(uuid: string, streamUrl: string): Promise<string | null> {
  const cached = nowPlayingCache.get(uuid);
  if (cached !== undefined) return cached;

  // TODO: enable when ready to use AudD credits (combine with ICY first)
  // const title = await recognizeSong(streamUrl);
  // nowPlayingCache.set(uuid, title);
  // return title;
  void uuid; void streamUrl;
  return null;
}
