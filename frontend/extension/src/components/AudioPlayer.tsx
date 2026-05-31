import styles from './AudioPlayer.module.css';

type Props = {
  isPlaying: boolean;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onVolume: (v: number) => void;
};

function AudioPlayer({ isPlaying, volume, onPlay, onPause, onVolume }: Props) {
  return (
    <div className="flex flex-row-reverse items-center gap-3">
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onVolume(Number(e.target.value))}
        className={styles.slider}
        style={{ '--volume': `${volume * 100}%` } as React.CSSProperties}
        aria-label="Volumen"
      />

      <button
        className={styles.button}
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default AudioPlayer;
