import { useEffect, useState } from "react";

import TunerWheel from "./components/TunerWheel";
import AudioPlayer from "./components/AudioPlayer";
import BandSwitch from "./components/BandSwitch";
import { useTuner } from "./hooks/useTuner";

function App() {
  const tuner = useTuner();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") ?? "retro");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const displayRadio = tuner.previewRadio ?? tuner.selectedRadio;

  return (
    <div className="flex flex-col w-full min-h-screen p-5 box-border">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-5">
        <BandSwitch value={tuner.band} onChange={tuner.changeBand} />

        <div className="text-center text-sm font-semibold text-fg-muted truncate px-3">
          {tuner.selectedRadio?.name}
        </div>

        <div className="flex items-center justify-end gap-3">
          <AudioPlayer selectedRadio={tuner.selectedRadio} isTuning={tuner.isTuning} />
          <button
            onClick={() => setTheme(t => t === "retro" ? "" : "retro")}
            className="border-none cursor-pointer bg-panel-light text-fg rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0"
            style={{ width: "var(--button-size)", height: "var(--button-size)" }}
          >
            {theme === "retro" ? "retro" : "dark"}
          </button>
        </div>
      </div>



      <div className={`flex-1 flex flex-col items-center justify-center gap-2.5 transition-opacity md:px-[10%]${tuner.previewRadio ? " opacity-50" : ""}`}>
              <div className="flex justify-center pb-4">
        <TunerWheel
          band={tuner.band}
          value={tuner.frequency}
          onChange={tuner.handleFrequencyChange}
          onRelease={tuner.handleFrequencyRelease}
        />
      </div>
        {displayRadio && (
          <>
            <div className="text-[40px] font-bold text-fg text-center tracking-tight leading-tight">
              {displayRadio.name}
            </div>
            <div className="text-xl text-fg-muted font-medium tracking-widest">
              {displayRadio.band} {displayRadio.frequency}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default App;
