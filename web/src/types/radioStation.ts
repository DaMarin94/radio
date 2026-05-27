export type RadioStation = {
  id: string;
  name: string;
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
};

export type TuningMode = "CONTINUOUS" | "SNAP";