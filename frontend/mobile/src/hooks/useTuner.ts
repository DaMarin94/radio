import { useState } from "react";
import type { RadioStation } from "@radio/shared";

/**
 * STUB. Minimal tuner state hook.
 * TODO(mobile-v1): port the full tuner logic (station fetching via services/api,
 * resolveStationByTuning from @radio/shared, StreamRetry, playback via lib/audio).
 */
export function useTuner() {
  const [value, setValue] = useState<number>(100.7);
  const [station] = useState<RadioStation | null>(null);

  return {
    value,
    setValue,
    station,
    isPlaying: false,
  };
}
