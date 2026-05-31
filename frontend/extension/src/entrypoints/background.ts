import type { BackgroundMessage, OffscreenMessage, PlayerState, PopupMessage } from '../lib/messages';

const STORAGE_KEY = 'playerState';

type PersistedState = { station: PlayerState['station']; volume: number };

function isBackgroundMessage(m: unknown): m is BackgroundMessage {
  return typeof m === 'object' && m !== null && (m as Record<string, unknown>).target === 'background';
}

export default defineBackground(() => {
  let state: PlayerState = { station: null, isPlaying: false, volume: 1 };

  // Firefox MV2: background is a persistent page with full DOM — play audio directly.
  // Chrome MV3: background is a service worker — audio goes through offscreen document.
  let directAudio: HTMLAudioElement | null = null;
  if (import.meta.env.FIREFOX) {
    directAudio = new Audio();
    directAudio.volume = state.volume;
  }

  // Restore persisted volume + last station. isPlaying is intentionally NOT restored —
  // we don't want audio auto-starting on browser restart.
  browser.storage.local.get(STORAGE_KEY).then((result) => {
    const saved = result[STORAGE_KEY] as PersistedState | undefined;
    if (!saved) return;
    state = { ...state, station: saved.station ?? null, volume: saved.volume ?? 1 };
    if (directAudio) directAudio.volume = state.volume;
  }).catch(() => {});

  function persist() {
    const toSave: PersistedState = { station: state.station, volume: state.volume };
    browser.storage.local.set({ [STORAGE_KEY]: toSave }).catch(() => {});
  }

  async function ensureOffscreen() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (chrome as any).offscreen.createDocument({
        url: browser.runtime.getURL('offscreen.html'),
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Reproducción de stream de radio',
      });
    } catch {
      // Document already exists — that's fine
    }
  }

  async function sendAudioCommand(msg: OffscreenMessage) {
    if (directAudio) {
      if (msg.type === 'AUDIO_PLAY') {
        if (directAudio.src !== msg.url) directAudio.src = msg.url;
        directAudio.play().catch(console.error);
      } else if (msg.type === 'AUDIO_PAUSE') {
        directAudio.pause();
      } else if (msg.type === 'AUDIO_SET_VOLUME') {
        directAudio.volume = msg.volume;
      }
    } else {
      await ensureOffscreen();
      browser.runtime.sendMessage(msg).catch(() => {});
    }
  }

  browser.runtime.onMessage.addListener((msg) => {
    if (!isBackgroundMessage(msg)) return;

    if (msg.type === 'GET_STATE') {
      return Promise.resolve({ target: 'popup', type: 'STATE', state } as PopupMessage);
    }

    return (async () => {
      if (msg.type === 'SET_STATION') {
        state = { ...state, station: msg.station, isPlaying: true };
        persist();
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_PLAY', url: msg.station.streamUrl });
      } else if (msg.type === 'PLAY') {
        if (!state.station) return;
        state = { ...state, isPlaying: true };
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_PLAY', url: state.station.streamUrl });
      } else if (msg.type === 'PAUSE') {
        state = { ...state, isPlaying: false };
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_PAUSE' });
      } else if (msg.type === 'SET_VOLUME') {
        state = { ...state, volume: msg.volume };
        persist();
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_SET_VOLUME', volume: msg.volume });
      }
    })();
  });
});
