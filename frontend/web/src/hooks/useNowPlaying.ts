import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { RadioStation } from "@radio/shared";

const POLL_INTERVAL_MS = 60_000;

export function useNowPlaying(station: RadioStation | null): string | null {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setNowPlaying(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!station) return;

    const fetch = () => {
      api
        .get(`/radios/nowplaying/${station.id}`, { params: { url: station.streamUrl } })
        .then((res) => setNowPlaying((res.data.title as string | null) ?? null))
        .catch(() => {});
    };

    fetch();
    intervalRef.current = setInterval(fetch, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [station?.id]);

  return nowPlaying;
}
