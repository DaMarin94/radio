import { useEffect, useRef, useState } from "react";

import type { RadioStation } from "../types/radioStation";

type Props = {
  selectedRadio: RadioStation | null;
};

function AudioPlayer({
  selectedRadio,
}: Props) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [volume, setVolume] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "player-volume"
        );

      if (!saved) {
        return 1;
      }

      return Number(saved);
    });

  const [isMuted, setIsMuted] =
    useState(false);

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
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    localStorage.setItem(
      "player-volume",
      String(volume)
    );
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!audioRef.current || !selectedRadio) {
      return;
    }

    audioRef.current.src =
      selectedRadio.streamUrl;

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(console.error);
  }, [selectedRadio]);

  return (
    <div className="audio-player">
      <audio ref={audioRef} hidden />

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) =>
          setVolume(Number(e.target.value))
        }
        className="audio-player-slider"
      />

      <button
        className="audio-player-button audio-player-button-small"
        onClick={() =>
          setIsMuted((prev) => !prev)
        }
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <button
        onClick={togglePlayback}
        className="audio-player-button audio-player-button-small"
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>
    </div>
  );
}

export default AudioPlayer;