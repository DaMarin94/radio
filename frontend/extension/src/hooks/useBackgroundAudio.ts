import { useEffect, useRef, useState } from 'react';
import type { RadioStation } from '@radio/shared';
import type { BackgroundMessage, PlayerState, PopupMessage } from '../lib/messages';

const DEFAULT_STATE: PlayerState = { station: null, isPlaying: false, volume: 1 };

export function useBackgroundAudio(selectedRadio: RadioStation | null) {
  const [playerState, setPlayerState] = useState<PlayerState>(DEFAULT_STATE);
  const prevStationIdRef = useRef<string | null>(null);

  // Sync state from background when popup opens
  useEffect(() => {
    browser.runtime
      .sendMessage({ target: 'background', type: 'GET_STATE' } satisfies BackgroundMessage)
      .then((res: PopupMessage) => {
        if (res?.type === 'STATE') setPlayerState(res.state);
      })
      .catch(() => {});
  }, []);

  // Notify background whenever the tuner selects a new station
  useEffect(() => {
    if (!selectedRadio) return;
    if (selectedRadio.id === prevStationIdRef.current) return;
    prevStationIdRef.current = selectedRadio.id;

    browser.runtime
      .sendMessage({ target: 'background', type: 'SET_STATION', station: selectedRadio } satisfies BackgroundMessage)
      .catch(() => {});

    setPlayerState((s) => ({ ...s, station: selectedRadio, isPlaying: true }));
  }, [selectedRadio]);

  function play() {
    browser.runtime
      .sendMessage({ target: 'background', type: 'PLAY' } satisfies BackgroundMessage)
      .catch(() => {});
    setPlayerState((s) => ({ ...s, isPlaying: true }));
  }

  function pause() {
    browser.runtime
      .sendMessage({ target: 'background', type: 'PAUSE' } satisfies BackgroundMessage)
      .catch(() => {});
    setPlayerState((s) => ({ ...s, isPlaying: false }));
  }

  function setVolume(volume: number) {
    browser.runtime
      .sendMessage({ target: 'background', type: 'SET_VOLUME', volume } satisfies BackgroundMessage)
      .catch(() => {});
    setPlayerState((s) => ({ ...s, volume }));
  }

  return { playerState, play, pause, setVolume };
}
