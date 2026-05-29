import {
  RadioBrowserStation,
  RadioStation,
} from "../models/radioStation";

import {
  detectBand,
  extractFrequency,
  formatDisplayName,
} from "../utils/radioUtils";

// AR-B = Buenos Aires province, AR-C = CABA
const BA_ISO_CODES = new Set(["AR-B", "AR-C"]);

export function hasValidStream(station: RadioBrowserStation): boolean {
  return Boolean(station.name && station.url_resolved) && station.lastcheckok !== 0;
}

export function isBuenosAiresStation(station: RadioBrowserStation): boolean {
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

export function mapRadioStation(
  station: RadioBrowserStation
): RadioStation {
  const name = station.name.trim().replace(/\s+/g, " ");
  const band = detectBand(station.name);
  const frequency = station.frequency?.trim() || extractFrequency(station.name);

  return {
    id: station.stationuuid,

    name,
    displayName: formatDisplayName(name),

    streamUrl: station.url_resolved?.replace(/^http:\/\//i, "https://") ?? station.url_resolved,

    favicon: station.favicon ?? null,
    homepage: station.homepage ?? null,

    country: station.country ?? null,
    state: station.state ?? null,

    tags: station.tags
      ? station.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],

    codec: station.codec ?? null,
    bitrate: station.bitrate ?? null,

    frequency,
    band,

    lat: station.geo_lat ? parseFloat(station.geo_lat) : null,
    lng: station.geo_long ? parseFloat(station.geo_long) : null,

    clickcount: station.clickcount ?? 0,
    votes: station.votes ?? 0,
  };
}
