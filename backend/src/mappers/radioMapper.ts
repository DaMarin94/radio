import {
  RadioBrowserStation,
  RadioStation,
} from "../models/radioStation";

import {
  detectBand,
  extractFrequency,
} from "../utils/radioUtils";

export function mapRadioStation(
  station: RadioBrowserStation
): RadioStation {
  return {
    id: station.stationuuid,

    name: station.name
      .trim()
      .replace(/\s+/g, " "),

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

    frequency: extractFrequency(station.name),

    band: detectBand(station.name),
  };
}