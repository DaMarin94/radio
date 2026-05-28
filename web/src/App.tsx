import { useEffect, useState } from "react";

import TunerWheel from "./components/TunerWheel";
import AudioPlayer from "./components/AudioPlayer";
import BandSwitch from "./components/BandSwitch";
import { useTuner } from "./hooks/useTuner";

function App() {
  const tuner = useTuner();

  const THEMES = ["digital", "dark", "amber", "blue", "light", "warm"] as const;
  type Theme = typeof THEMES[number];
  const THEME_LABELS: Record<Theme, string> = { digital: "digital", dark: "dark", amber: "amber", blue: "blue", light: "light", warm: "warm" };

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") ?? "digital") as Theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const displayRadio = tuner.previewRadio ?? tuner.selectedRadio;

  return (
    <div className="flex flex-col w-full min-h-screen p-5 box-border">
      <div className="flex items-center justify-between mb-5">
        <BandSwitch value={tuner.band} onChange={tuner.changeBand} />

        <div className="flex items-center gap-3">
          <AudioPlayer selectedRadio={tuner.selectedRadio} isTuning={tuner.isTuning} />
          <button
            onClick={() => setTheme(t => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length])}
            className="border-none cursor-pointer bg-panel-light text-fg rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0"
            style={{ width: "var(--button-size)", height: "var(--button-size)" }}
          >
            {THEME_LABELS[theme]}
          </button>
        </div>
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
                {displayRadio.displayName}
              </div>
              <div className="text-base sm:text-xl text-fg-muted font-medium tracking-widest">
                {displayRadio.band} {displayRadio.frequency}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
