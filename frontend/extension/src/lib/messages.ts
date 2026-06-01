import type { RadioStation } from '@radio/shared';

export type PlayerState = {
  station: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isBuffering: boolean;
};

// Popup → Background
export type BackgroundMessage =
  | { target: 'background'; type: 'PLAY' }
  | { target: 'background'; type: 'PAUSE' }
  | { target: 'background'; type: 'SET_STATION'; station: RadioStation }
  | { target: 'background'; type: 'SET_VOLUME'; volume: number }
  | { target: 'background'; type: 'GET_STATE' }
  | { target: 'background'; type: 'AUDIO_STATUS'; buffering: boolean };

// Background → Popup (response to GET_STATE or live push)
export type PopupMessage = { target: 'popup'; type: 'STATE'; state: PlayerState };

// Background → Offscreen document (Chrome only)
export type OffscreenMessage =
  | { target: 'offscreen'; type: 'AUDIO_PLAY'; url: string; volume: number }
  | { target: 'offscreen'; type: 'AUDIO_PAUSE' }
  | { target: 'offscreen'; type: 'AUDIO_SET_VOLUME'; volume: number };
