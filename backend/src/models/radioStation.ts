export type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;

  favicon: string | null;
  homepage: string | null;

  country: string | null;
  state: string | null;

  tags: string[];

  codec: string | null;
  bitrate: number | null;

  frequency: string | null;
  band: "AM" | "FM" | null;

  lat: number | null;
  lng: number | null;

  clickcount: number;
};

export type RadioBrowserStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;

  favicon?: string;
  homepage?: string;

  country?: string;
  state?: string;

  tags?: string;

  codec?: string;
  bitrate?: number;

  geo_lat?: string | null;
  geo_long?: string | null;

  clickcount?: number;
};
