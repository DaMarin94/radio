import {
  RadioBrowserStation,
  RadioStation,
} from "../models/radioStation";

import {
  detectBand,
  extractFrequency,
  formatDisplayName,
} from "../utils/radioUtils";

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

    streamUrl: station.url_resolved,

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
  };
}
