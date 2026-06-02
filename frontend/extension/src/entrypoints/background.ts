import type { BackgroundMessage, OffscreenMessage, OffscreenQueryResponse, PlayerState, PopupMessage } from '../lib/messages';
import { StreamRetry } from '@radio/shared';

const STORAGE_KEY = 'playerState';

type PersistedState = { station: PlayerState['station']; volume: number };

function isBackgroundMessage(m: unknown): m is BackgroundMessage {
  return typeof m === 'object' && m !== null && (m as Record<string, unknown>).target === 'background';
}

export default defineBackground(() => {
  let state: PlayerState = { station: null, isPlaying: false, volume: 1, isBuffering: false };

  // Firefox MV2: background is a persistent page with full DOM — play audio directly.
  // Chrome MV3: background is a service worker — audio goes through offscreen document.
  let directAudio: HTMLAudioElement | null = null;
  let directRetry: StreamRetry | null = null;
  if (import.meta.env.FIREFOX) {
    directAudio = new Audio();
    directAudio.volume = state.volume;
    directRetry = new StreamRetry();
    directAudio.addEventListener('loadstart', () => {
      state = { ...state, isBuffering: true };
      broadcastState();
    });
    directAudio.addEventListener('waiting', () => {
      state = { ...state, isBuffering: true };
      broadcastState();
    });
    directAudio.addEventListener('stalled', () => {
      state = { ...state, isBuffering: true };
      broadcastState();
    });
    directAudio.addEventListener('error', () => {
      if (!state.isPlaying || !state.station || !directRetry) return;
      const station = state.station;
      state = { ...state, isBuffering: true };
      broadcastState();
      directRetry.schedule(() => {
        if (!directAudio || !state.isPlaying || state.station?.id !== station.id) return;
        directAudio.src = station.streamUrl;
        directAudio.play().catch(console.error);
      });
    });
    directAudio.addEventListener('playing', () => {
      directRetry?.reset();
      state = { ...state, isBuffering: false };
      broadcastState();
    });
  }

  // Restore persisted volume + last station. isPlaying is intentionally NOT restored —
  // we don't want audio auto-starting on browser restart.
  // readyPromise is awaited by GET_STATE so the popup never reads stale defaults.
  const readyPromise = browser.storage.local.get(STORAGE_KEY).then((result) => {
    const saved = result[STORAGE_KEY] as PersistedState | undefined;
    if (!saved) return;
    state = { ...state, station: saved.station ?? null, volume: saved.volume ?? 1 };
    if (directAudio) directAudio.volume = state.volume;
  }).catch(() => {});

  function persist() {
    const toSave: PersistedState = { station: state.station, volume: state.volume };
    browser.storage.local.set({ [STORAGE_KEY]: toSave }).catch(() => {});
  }

  function broadcastState() {
    browser.runtime.sendMessage({ target: 'popup', type: 'STATE', state } satisfies PopupMessage).catch(() => {});
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
        directRetry?.reset();
        directAudio.volume = msg.volume;
        if (directAudio.src !== msg.url) directAudio.src = msg.url;
        directAudio.play().catch(console.error);
      } else if (msg.type === 'AUDIO_PAUSE') {
        directRetry?.reset();
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
      return (async () => {
        await readyPromise;
        // Reconcile isPlaying with the real audio source to handle the case where
        // the Chrome MV3 service worker was killed mid-session and restarted while
        // the offscreen document kept playing. We distinguish this from a real browser
        // restart (where no offscreen document exists) and keep isPlaying = false there.
        if (directAudio) {
          // Firefox: directAudio lives in this same page — just check it directly.
          state = { ...state, isPlaying: !!state.station && !directAudio.paused };
        } else {
          // Chrome: query the offscreen document, if one exists.
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hasDoc = await (chrome as any).offscreen.hasDocument();
            if (hasDoc) {
              const response = await browser.runtime.sendMessage({ target: 'offscreen', type: 'AUDIO_QUERY' }) as OffscreenQueryResponse | undefined;
              state = { ...state, isPlaying: !!state.station && !!response?.playing };
            }
          } catch {
            // If the query fails for any reason, leave isPlaying as-is.
          }
        }
        return { target: 'popup', type: 'STATE', state } satisfies PopupMessage;
      })();
    }

    // AUDIO_STATUS comes from the offscreen document (Chrome only) — no readyPromise needed
    // but we keep it inside the async IIFE for consistency with the rest of the handlers.
    return (async () => {
      await readyPromise;
      if (msg.type === 'AUDIO_STATUS') {
        state = { ...state, isBuffering: msg.buffering };
        broadcastState();
      } else if (msg.type === 'SET_STATION') {
        state = { ...state, station: msg.station, isPlaying: true, isBuffering: true };
        persist();
        broadcastState();
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_PLAY', url: msg.station.streamUrl, volume: state.volume });
      } else if (msg.type === 'PLAY') {
        if (!state.station) return;
        state = { ...state, isPlaying: true, isBuffering: true };
        broadcastState();
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_PLAY', url: state.station.streamUrl, volume: state.volume });
      } else if (msg.type === 'PAUSE') {
        state = { ...state, isPlaying: false, isBuffering: false };
        broadcastState();
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_PAUSE' });
      } else if (msg.type === 'SET_VOLUME') {
        state = { ...state, volume: msg.volume };
        persist();
        await sendAudioCommand({ target: 'offscreen', type: 'AUDIO_SET_VOLUME', volume: msg.volume });
      }
    })();
  });
});
