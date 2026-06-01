import { useEffect, useRef, useState } from "react";
import type { RadioStation } from "@radio/shared";
import { useDevice } from "../context/DeviceContext";
import styles from "./AudioPlayer.module.css";

type Props = {
  selectedRadio: RadioStation | null;
  isTuning: boolean;
  onError?: () => void;
  onBufferingChange?: (buffering: boolean) => void;
  onNeedsGesture?: (needs: boolean) => void;
};

function AudioPlayer({ selectedRadio, isTuning, onError, onBufferingChange, onNeedsGesture }: Props) {
  const { isMobile } = useDevice();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const staticSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const staticGainRef = useRef<GainNode | null>(null);

  const [audioReady, setAudioReady] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);
  const needsGestureRef = useRef(false);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("player-volume");
    return saved ? Number(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const isBuffering = selectedRadio !== null && !audioReady && !isTuning && !streamFailed;

  useEffect(() => {
    onBufferingChange?.(isBuffering);
  }, [isBuffering, onBufferingChange]);

  // Close AudioContext on unmount
  useEffect(() => {
    return () => { audioCtxRef.current?.close(); };
  }, []);

  // Proactive autoplay test: detect block before any station loads
  useEffect(() => {
    const test = new Audio();
    test.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAAACABAAZGF0YQAAAAA=";
    test.volume = 0;
    test.play()
      .then(() => { test.pause(); })
      .catch((e: DOMException) => {
        if (e.name === "NotAllowedError") {
          needsGestureRef.current = true;
          onNeedsGesture?.(true);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Retry play() on first user gesture (mobile autoplay unlock)
  useEffect(() => {
    const retry = () => {
      // Unlock AudioContext (iOS requires gesture context)
      if (!audioCtxRef.current) {
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioCtx();
        } catch { /* unsupported */ }
      }
      audioCtxRef.current?.resume();

      if (!needsGestureRef.current || !audioRef.current) return;
      needsGestureRef.current = false;
      onNeedsGesture?.(false);
      setStreamFailed(false);
      setAudioReady(false);
      audioRef.current.play().catch(() => {});
    };
    document.addEventListener("touchstart", retry, { once: true, passive: true });
    document.addEventListener("click", retry, { once: true });
    return () => {
      document.removeEventListener("touchstart", retry);
      document.removeEventListener("click", retry);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shouldPlayStatic = !isMuted && (isTuning || (selectedRadio !== null && !audioReady));

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted || shouldPlayStatic;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, shouldPlayStatic]);

  useEffect(() => {
    if (!shouldPlayStatic) return;

    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      } catch {
        return;
      }
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const bufferSize = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volumeRef.current * 0.08;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    staticSourceRef.current = source;
    staticGainRef.current = gain;

    return () => {
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      staticSourceRef.current = null;
      staticGainRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlayStatic]);

  useEffect(() => {
    if (staticGainRef.current) {
      staticGainRef.current.gain.value = volume * 0.08;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("player-volume", String(volume));
  }, [volume]);

  useEffect(() => {
    setAudioReady(false);
    setStreamFailed(false);
    if (!audioRef.current || !selectedRadio) return;

    const audio = audioRef.current;
    const handlePlaying = () => setAudioReady(true);
    const handleError = () => {
      // Aborted = station switched mid-load, not a real error
      if (audio.error?.code === MediaError.MEDIA_ERR_ABORTED) return;
      // Pre-gesture errors on mobile are likely preload false positives
      if (needsGestureRef.current) return;
      setStreamFailed(true);
      onError?.();
    };
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    audio.src = selectedRadio.streamUrl;
    audio.play().catch((err: DOMException) => {
      if (err.name === "AbortError") return;
      if (err.name === "NotAllowedError") { setAudioReady(true); needsGestureRef.current = true; onNeedsGesture?.(true); return; }
      console.error(err);
      setStreamFailed(true);
      onError?.();
    });

    return () => {
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
    };
  }, [selectedRadio]);

  return (
    <div className="flex flex-row-reverse items-center gap-3">
      <audio ref={audioRef} hidden />

      {!isMobile && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className={styles.slider}
          style={{ "--volume": `${volume * 100}%` } as React.CSSProperties}
          aria-label="Volumen"
        />
      )}

      <button className={styles.button} onClick={() => setIsMuted((p) => !p)} aria-label={isMuted ? "Activar sonido" : "Silenciar"}>
        {isMuted ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3.63 3.63a1 1 0 0 0 0 1.41L7.29 8.7 7 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l4 4V13.41l3.18 3.18A5 5 0 0 1 9 18.93V21a7 7 0 0 0 5.65-2.89l1.72 1.72a1 1 0 1 0 1.41-1.41L5.04 3.63a1 1 0 0 0-1.41 0zM11 15.17L9.83 14H7v-4h2.17l.28-.28L11 11.17v4zm6.5-3.17a4.5 4.5 0 0 0-2.6-4.1l-1.5 1.5A2.5 2.5 0 0 1 15 12a2.5 2.5 0 0 1-.12.75L16.5 14.3c.63-.94 1-2.05 1-3.3zM19 12c0 2.1-.87 4-2.27 5.37l1.41 1.42C19.93 17.1 21 14.67 21 12c0-2.67-1.07-5.1-2.82-6.82L16.77 6.6A7 7 0 0 1 19 12z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>

    </div>
  );
}

export default AudioPlayer;
