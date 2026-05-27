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
  const [frequency, setFrequency] =
    useState(() => {
      const savedBand =
        (localStorage.getItem(
          "bandFilter"
        ) as "AM" | "FM") || "FM";

      return getSavedFrequency(savedBand);
    });
  const [selectedRadio, setSelectedRadio] =
    useState<RadioStation | null>(null);

  const [bandFilter, setBandFilter] =
    useState<BandFilter>(() => {
      const saved =
        localStorage.getItem("bandFilter");

      return saved === "AM"
        ? "AM"
        : "FM";
    });

  const [previewRadio, setPreviewRadio] =
    useState<RadioStation | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.setItem(
      `frequency-${bandFilter}`,
      String(frequency)
    );
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

  function handleFrequencyChange(value: number) {
    const closest = resolveStationByTuning(value, filteredRadios);

    setPreviewRadio(closest);
    setFrequency(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (closest) setSelectedRadio(closest);
    }, 300);
  }

  const filteredRadios = useMemo(() => {
    return radios.filter(
      (radio) => radio.band === bandFilter
    );
  }, [radios, bandFilter]);

  useEffect(() => {
    if (!selectedRadio) {
      return;
    }

    localStorage.setItem(
      `selectedRadio-${bandFilter}`,
      selectedRadio.id
    );
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

    const savedRadioId =
      localStorage.getItem(`selectedRadio-${nextBand}`);

    if (savedRadioId) {
      const savedRadio = radios.find((radio) => radio.id === savedRadioId);
      if (savedRadio) setSelectedRadio(savedRadio);
    }
  }

  return (
    <div className="app">
      <div className="app-header">
        <BandSwitch
          value={bandFilter}
          onChange={changeBand}
        />

        <div className="app-header-station">
          {selectedRadio?.name}
        </div>

        {selectedRadio && (
          <AudioPlayer selectedRadio={selectedRadio} />
        )}
      </div>

      <div className={`station-display${previewRadio ? " station-display--preview" : ""}`}>
        {(previewRadio ?? selectedRadio) && (
          <>
            <div className="station-display-name">
              {(previewRadio ?? selectedRadio)!.name}
            </div>
            <div className="station-display-freq">
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
