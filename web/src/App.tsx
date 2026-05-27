import { useEffect, useMemo, useState } from "react";

import { api } from "./services/api";

import type { RadioStation, TuningMode } from "./types/radioStation";

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
  const [tuningMode, ] = useState<TuningMode>("SNAP");
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

  useEffect(() => {
    localStorage.setItem(
      `frequency-${bandFilter}`,
      String(frequency)
    );
  }, [frequency]);

  useEffect(() => {
    async function loadRadios() {
      try {
        const response = await api.get(
          "/radios/buenos-aires"
        );

        setRadios(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadRadios();
  }, []);

  function handleFrequencyChange(value: number) {
    const closest = resolveStationByTuning(
      value,
      filteredRadios,
      tuningMode
    );

    setPreviewRadio(closest);
    setFrequency(value);
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
    const station = resolveStationByTuning(
      value,
      filteredRadios,
      tuningMode
    );

    if (!station) return;

    setSelectedRadio(station);
    setPreviewRadio(null);
  }

  function changeBand(
    nextBand: "AM" | "FM"
  ) {
    setBandFilter(nextBand);

    const savedFrequency =
      getSavedFrequency(nextBand);

    setFrequency(savedFrequency);

    const savedRadioId =
      localStorage.getItem(
        `selectedRadio-${nextBand}`
      );

    if (!savedRadioId) {
      return;
    }

    const savedRadio = radios.find(
      (radio) =>
        radio.id === savedRadioId
    );

    if (savedRadio) {
      setSelectedRadio(savedRadio);
    }
  }

  return (
    <div className="app">
      <BandSwitch
        value={bandFilter}
        onChange={changeBand}
      />

      {selectedRadio && (
        <div className="player-container">
          <AudioPlayer
            selectedRadio={selectedRadio}
          />
        </div>
      )}

      {selectedRadio && (
        <div className="selected-radio-info">
          <h2>{selectedRadio.name}</h2>
          <div>
            {selectedRadio.band}
            {" "}
            {selectedRadio.frequency}
          </div>
        </div>
      )}

      <TunerSlider
        min={bandFilter === "AM" ? 530 : 87}
        max={bandFilter === "AM" ? 1700 : 108}
        value={frequency}
        onChange={handleFrequencyChange}
        onRelease={handleFrequencyRelease}
      />

      <div className="selected-radio-info">
        <h2>
          {previewRadio?.name}
        </h2>

        <div>
          {previewRadio?.frequency}
          {" "}
          {previewRadio?.band}
        </div>
      </div>

    </div>
  );
}

export default App;