import { useEffect, useMemo, useState } from "react";

import { api } from "./services/api";

import type { RadioStation, TuningMode } from "./types/radioStation";

import TunerSlider from "./components/TunerSlider";
import AudioPlayer from "./components/AudioPlayer";
import BandSwitch from "./components/BandSwitch";
import { getSavedFrequency } from "./helpers/getSavedFrequency";
import { resolveStationByTuning, getUserLocation } from "./helpers/tuning";

type BandFilter = "AM" | "FM";
type UserLocation = { lat: number; lng: number };

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

  const [nearbyMode, setNearbyMode] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(
      `frequency-${bandFilter}`,
      String(frequency)
    );
  }, [frequency]);

  async function loadRadios(location?: UserLocation | null) {
    try {
      if (location) {
        const response = await api.get("/radios/by-location", {
          params: { lat: location.lat, lng: location.lng },
        });
        setRadios(response.data.stations);
        setDetectedCity(response.data.location.city);
      } else {
        const response = await api.get("/radios/buenos-aires");
        setRadios(response.data);
        setDetectedCity(null);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadRadios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleNearby() {
    if (nearbyMode) {
      setNearbyMode(false);
      setUserLocation(null);
      loadRadios(null);
      return;
    }

    setNearbyLoading(true);
    const location = await getUserLocation();
    setNearbyLoading(false);

    if (!location) return;

    setNearbyMode(true);
    setUserLocation(location);
    loadRadios(location);
  }

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

    // no re-fetch needed: by-location already returned all local stations,
    // band filtering happens client-side via filteredRadios
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
        min={bandFilter === "AM" ? 530 : 76}
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