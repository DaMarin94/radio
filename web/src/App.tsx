import { useEffect, useMemo, useRef, useState } from "react";

import { api } from "./services/api";

import type { RadioStation } from "./types/radioStation";

import TunerSlider from "./components/TunerSlider";
import AudioPlayer from "./components/AudioPlayer";
import BandSwitch from "./components/BandSwitch";
import { getSavedFrequency } from "./helpers/getSavedFrequency";
import { resolveStationByTuning } from "./helpers/tuning";

type BandFilter = "AM" | "FM";

function App() {
  const [radios, setRadios] = useState<RadioStation[]>([]);
  const [frequency, setFrequency] = useState(() => {
    const savedBand = (localStorage.getItem("bandFilter") as "AM" | "FM") || "FM";
    return getSavedFrequency(savedBand);
  });
  const [selectedRadio, setSelectedRadio] = useState<RadioStation | null>(null);
  const [bandFilter, setBandFilter] = useState<BandFilter>(() => {
    return localStorage.getItem("bandFilter") === "AM" ? "AM" : "FM";
  });
  const [previewRadio, setPreviewRadio] = useState<RadioStation | null>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") ?? "retro");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(`frequency-${bandFilter}`, String(frequency));
  }, [frequency]);

  async function loadRadios() {
    try {
      const response = await api.get("/radios/buenos-aires");
      setRadios(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadRadios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (radios.length === 0) return;

    const savedRadioId = localStorage.getItem(`selectedRadio-${bandFilter}`);
    if (!savedRadioId) return;

    const savedRadio = radios.find((radio) => radio.id === savedRadioId);
    if (savedRadio) setSelectedRadio(savedRadio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radios]);

  const filteredRadios = useMemo(() => {
    return radios.filter((radio) => radio.band === bandFilter);
  }, [radios, bandFilter]);

  function handleFrequencyChange(value: number) {
    const closest = resolveStationByTuning(value, filteredRadios);

    setPreviewRadio(closest);
    setFrequency(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (closest) setSelectedRadio(closest);
    }, 300);
  }

  useEffect(() => {
    document.title = selectedRadio ? `${selectedRadio.name} — Radio` : "Radio";
    if (!selectedRadio) return;
    localStorage.setItem(`selectedRadio-${bandFilter}`, selectedRadio.id);
  }, [selectedRadio, bandFilter]);

  function handleFrequencyRelease(value: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const station = resolveStationByTuning(value, filteredRadios);
    if (!station) return;

    setSelectedRadio(station);
    setPreviewRadio(null);
  }

  function changeBand(nextBand: "AM" | "FM") {
    setBandFilter(nextBand);

    const savedFrequency = getSavedFrequency(nextBand);
    setFrequency(savedFrequency);

    const savedRadioId = localStorage.getItem(`selectedRadio-${nextBand}`);
    if (savedRadioId) {
      const savedRadio = radios.find((radio) => radio.id === savedRadioId);
      if (savedRadio) setSelectedRadio(savedRadio);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-5 box-border">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-5">
        <BandSwitch value={bandFilter} onChange={changeBand} />

        <div className="text-center text-sm font-semibold text-fg-muted truncate px-3">
          {selectedRadio?.name}
        </div>

        <div className="flex items-center justify-end gap-3">
          <AudioPlayer selectedRadio={selectedRadio} isTuning={previewRadio !== null} />
          <button
            onClick={() => setTheme(t => t === "retro" ? "" : "retro")}
            className="border-none cursor-pointer bg-panel-light text-fg rounded-full text-[10px] font-bold tracking-wider uppercase flex-shrink-0"
            style={{ width: "var(--button-size)", height: "var(--button-size)" }}
          >
            {theme === "retro" ? "retro" : "dark"}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center gap-2.5 transition-opacity md:px-[10%]${previewRadio ? " opacity-50" : ""}`}>
        {(previewRadio ?? selectedRadio) && (
          <>
            <div className="text-[40px] font-bold text-fg text-center tracking-tight leading-tight">
              {(previewRadio ?? selectedRadio)!.name}
            </div>
            <div className="text-xl text-fg-muted font-medium tracking-widest">
              {(previewRadio ?? selectedRadio)!.band}
              {" "}
              {(previewRadio ?? selectedRadio)!.frequency}
            </div>
          </>
        )}
      </div>

      <TunerSlider
        band={bandFilter}
        value={frequency}
        onChange={handleFrequencyChange}
        onRelease={handleFrequencyRelease}
      />
    </div>
  );
}

export default App;
