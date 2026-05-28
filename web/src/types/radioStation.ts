export type RadioStation = {
  id: string;
  name: string;
  displayName: string;
  streamUrl: string;

  favicon?: string | null;
  homepage?: string | null;

  country?: string | null;
  state?: string | null;

  tags: string[];

  codec?: string;
  bitrate?: number;

  frequency?: string | null;
  band?: "AM" | "FM" | null;

  lat?: number | null;
  lng?: number | null;

  clickcount?: number;
};

export type TuningMode = "CONTINUOUS" | "SNAP";