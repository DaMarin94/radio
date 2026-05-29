import { useEffect, useState } from "react";

import TunerWheel from "./components/TunerWheel";
import AudioPlayer from "./components/AudioPlayer";
import BandSwitch from "./components/BandSwitch";
import ThemePicker, { type Theme } from "./components/ThemePicker";
import LoadingBar from "./components/LoadingBar";
import { useTuner } from "./hooks/useTuner";

function App() {
  const tuner = useTuner();

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
          onBufferingChange={setIsBuffering}
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
