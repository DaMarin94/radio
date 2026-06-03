import TrackPlayer, { Event } from "react-native-track-player";

/**
 * Track-player background/playback service. STUB.
 *
 * This function is registered in index.ts via
 * `TrackPlayer.registerPlaybackService(() => PlaybackService)`. The OS invokes
 * it to wire remote (lock-screen / notification / headset) controls to the
 * player while the app is backgrounded.
 *
 * TODO(mobile-v1): wire remote events to the real tuner state.
 */
export async function PlaybackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
}

let isSetup = false;

/**
 * STUB. Idempotent player initialization. Call once before playback.
 * TODO(mobile-v1): configure capabilities, options and a real stream source.
 */
export async function setupPlayer(): Promise<void> {
  if (isSetup) return;
  await TrackPlayer.setupPlayer();
  isSetup = true;
}
