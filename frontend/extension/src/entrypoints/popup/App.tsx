import BandSwitch from '../../components/BandSwitch';
import TunerWheel from '../../components/TunerWheel';
import AudioPlayer from '../../components/AudioPlayer';
import LoadingBar from '../../components/LoadingBar';
import { useTuner } from '../../hooks/useTuner';
import { useBackgroundAudio } from '../../hooks/useBackgroundAudio';

export default function App() {
  const tuner = useTuner();
  const { playerState, play, pause, setVolume } = useBackgroundAudio(tuner.selectedRadio);

  const displayRadio = tuner.previewRadio ?? tuner.selectedRadio;

  return (
    <div className="relative w-80 bg-surface text-fg select-none overflow-hidden">
      <LoadingBar isLoading={tuner.isLoadingRadios || playerState.isBuffering} />
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <BandSwitch value={tuner.band} onChange={tuner.changeBand} />
        <AudioPlayer
          isPlaying={playerState.isPlaying}
          volume={playerState.volume}
          onPlay={play}
          onPause={pause}
          onVolume={setVolume}
        />
      </div>

      {/* Frequency display */}
      <div className="text-center px-4 pb-1">
        <span className="text-[28px] font-bold tabular-nums text-fg leading-none">
          {tuner.band === 'FM' ? tuner.frequency.toFixed(1) : tuner.frequency}
        </span>
        <span className="text-sm font-semibold ml-1.5 text-fg-muted">
          {tuner.band}
        </span>
      </div>

      {/* Tuner wheel */}
      <TunerWheel
        band={tuner.band}
        value={tuner.frequency}
        onChange={tuner.handleFrequencyChange}
        onRelease={tuner.handleFrequencyRelease}
      />

      {/* Station info */}
      <div className="px-4 py-3 min-h-[68px] flex flex-col justify-center">
        {tuner.isLoadingRadios ? (
          <p className="text-xs text-fg-muted animate-pulse tracking-widest uppercase">
            Listando radios...
          </p>
        ) : displayRadio ? (
          <div className={`transition-opacity${tuner.previewRadio ? ' opacity-40' : ''}`}>
            <div className="text-lg font-bold leading-tight text-fg line-clamp-1">
              {displayRadio.displayName}
            </div>
            <div className="text-xs mt-0.5 font-medium text-fg-muted tracking-wide">
              {displayRadio.band} {displayRadio.frequency}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
