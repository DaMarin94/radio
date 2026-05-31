import type { RadioStation } from '@radio/shared';

export type PlayerState = {
  station: RadioStation | null;
  isPlaying: boolean;
  volume: number;
};

// Popup → Background
export type BackgroundMessage =
  | { target: 'background'; type: 'PLAY' }
  | { target: 'background'; type: 'PAUSE' }
  | { target: 'background'; type: 'SET_STATION'; station: RadioStation }
  | { target: 'background'; type: 'SET_VOLUME'; volume: number }
  | { target: 'background'; type: 'GET_STATE' };

// Background → Popup (response to GET_STATE)
export type PopupMessage = { target: 'popup'; type: 'STATE'; state: PlayerState };

// Background → Offscreen document (Chrome only)
export type OffscreenMessage =
  | { target: 'offscreen'; type: 'AUDIO_PLAY'; url: string }
  | { target: 'offscreen'; type: 'AUDIO_PAUSE' }
  | { target: 'offscreen'; type: 'AUDIO_SET_VOLUME'; volume: number };
