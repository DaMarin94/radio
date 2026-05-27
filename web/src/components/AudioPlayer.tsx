import { useEffect, useRef, useState } from "react";
import type { RadioStation } from "../types/radioStation";
import styles from "./AudioPlayer.module.css";

type Props = {
  selectedRadio: RadioStation | null;
};

function AudioPlayer({ selectedRadio }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("player-volume");
    return saved ? Number(saved) : 1;
  });

  const [isMuted, setIsMuted] = useState(false);

  async function togglePlayback() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("player-volume", String(volume));
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!audioRef.current || !selectedRadio) return;
    audioRef.current.src = selectedRadio.streamUrl;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  }, [selectedRadio]);

  return (
    <div className="flex flex-row-reverse items-center gap-3">
      <audio ref={audioRef} hidden />

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className={styles.slider}
        style={{ "--volume": `${volume * 100}%` } as React.CSSProperties}
      />

      <button className={styles.button} onClick={() => setIsMuted((p) => !p)}>
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

      <button className={styles.button} onClick={togglePlayback}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </div>
  );
}

export default AudioPlayer;
