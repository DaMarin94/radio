export type RadioStation = {
  id: string;
  name: string;
  displayName: string;
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
  votes: number;
};

export type ReverseGeocodeResult = {
  city: string;
  state: string;
  country: string;
  countrycode: string; // uppercase ISO 3166-1 alpha-2, e.g. "AR"
};

export type RadioBrowserStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;

  favicon?: string;
  homepage?: string;

  country?: string;
  countrycode?: string;
  state?: string;
  iso_3166_2?: string;

  tags?: string;

  codec?: string;
  bitrate?: number;

  geo_lat?: string | null;
  geo_long?: string | null;

  frequency?: string;
  clickcount?: number;
  votes?: number;
  lastcheckok?: number;
};
