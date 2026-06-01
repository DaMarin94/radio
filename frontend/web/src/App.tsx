import { useEffect, useState } from "react";

import TunerWheel from "./components/TunerWheel";
import AudioPlayer from "./components/AudioPlayer";
import BandSwitch from "./components/BandSwitch";
import ThemePicker, { type Theme } from "./components/ThemePicker";
import LoadingBar from "./components/LoadingBar";
import { useTuner } from "./hooks/useTuner";
import { useNowPlaying } from "./hooks/useNowPlaying";

function App() {
  const tuner = useTuner();
  const nowPlaying = useNowPlaying(tuner.selectedRadio);

  const [confirmedTheme, setConfirmedTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") ?? "digital") as Theme
  );
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const activeTheme = previewTheme ?? confirmedTheme;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  const handleConfirm = (t: Theme) => {
    setConfirmedTheme(t);
    localStorage.setItem("theme", t);
    setPreviewTheme(null);
  };

  const [streamError, setStreamError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  const isLoading = tuner.isLoadingRadios || isBuffering;
  const loadingMessage = tuner.isLoadingRadios
    ? "Listando radios..."
    : isBuffering
      ? "Buffering..."
      : null;

  useEffect(() => { setStreamError(false); }, [tuner.selectedRadio]);

  const displayRadio = tuner.previewRadio ?? tuner.selectedRadio;

  return (
    <div className="flex flex-col w-full min-h-dvh p-5 box-border select-none">
      <LoadingBar isLoading={isLoading} />
      {needsGesture && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" className="text-fg opacity-70">
            <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26a1 1 0 0 0-.29-.09V6.5a1 1 0 0 0-2 0v7.53l-1.23-.26a3 3 0 0 0-2.9.8l-.13.13 3.45 3.46a5.002 5.002 0 0 0 3.55 1.47h2.09c1.46 0 2.72-.97 3.07-2.39l.39-1.57c.03-.14.05-.28.05-.42 0-.98-.61-1.83-1.51-2.22z"/>
          </svg>
          <p className="text-fg text-base font-semibold tracking-widest uppercase animate-pulse">
            toca para empezar
          </p>
        </div>
      )}
      {loadingMessage && (
        <div className="fixed bottom-16 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-sm text-fg-muted tracking-widest uppercase animate-pulse">
            {loadingMessage}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <BandSwitch value={tuner.band} onChange={tuner.changeBand} />
        <AudioPlayer
          selectedRadio={tuner.selectedRadio}
          isTuning={tuner.isTuning}
          onError={() => setStreamError(true)}
          onReady={() => setStreamError(false)}
          onBufferingChange={setIsBuffering}
          onNeedsGesture={setNeedsGesture}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center md:px-[10%]">
        <div className="text-center select-none mb-2">
          <span className="text-4xl font-bold text-fg tabular-nums tracking-tight">
            {tuner.band === "FM" ? tuner.frequency.toFixed(1) : tuner.frequency}
          </span>
          <span className="text-lg text-fg-muted font-medium ml-2">{tuner.band}</span>
        </div>
        <div className="flex justify-center w-full">
          <TunerWheel
            band={tuner.band}
            value={tuner.frequency}
            onChange={tuner.handleFrequencyChange}
            onRelease={tuner.handleFrequencyRelease}
          />
        </div>
        <div className="mt-4 min-h-27 flex flex-col items-center justify-start w-full px-4">
          {displayRadio && (
            <div className={`flex flex-col items-center gap-1 text-center transition-opacity${tuner.previewRadio ? " opacity-50" : ""}`}>
              <div className="text-[32px] sm:text-[40px] font-bold text-fg tracking-tight leading-tight line-clamp-2">
                {streamError && !tuner.previewRadio ? "—" : displayRadio.displayName}
              </div>
              <div className="text-base sm:text-xl text-fg-muted font-medium tracking-widest">
                {displayRadio.band} {displayRadio.frequency}
              </div>
              {nowPlaying && !tuner.previewRadio && (
                <div className="text-sm text-fg-muted font-medium tracking-wide opacity-70 line-clamp-1 max-w-xs">
                  {nowPlaying}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <ThemePicker
          active={activeTheme}
          onPreview={setPreviewTheme}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}

export default App;
