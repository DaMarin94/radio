import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import type { RadioStation } from "@radio/shared";
import { resolveStationByTuning, getUserLocation } from "@radio/shared";
import { getSavedFrequency } from "../helpers/getSavedFrequency";

type UserLocation = { lat: number; lng: number };

type Band = "AM" | "FM";

export function useTuner() {
  const [radios, setRadios] = useState<RadioStation[]>([]);
  const [frequency, setFrequency] = useState(() => {
    const savedBand = (localStorage.getItem("bandFilter") as Band) || "FM";
    return getSavedFrequency(savedBand);
  });
  const [selectedRadio, setSelectedRadio] = useState<RadioStation | null>(null);
  const [band, setBand] = useState<Band>(() => {
    return localStorage.getItem("bandFilter") === "AM" ? "AM" : "FM";
  });
  const [previewRadio, setPreviewRadio] = useState<RadioStation | null>(null);
  const [isLoadingRadios, setIsLoadingRadios] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    localStorage.setItem(`frequency-${band}`, String(frequency));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency]);

  useEffect(() => {
    getUserLocation().then((loc) => {
      setUserLocation(loc);
      const params = loc ? { lat: loc.lat, lng: loc.lng } : {};
      return api.get("/radios/buenos-aires", { params });
    })
      .then((res) => { setRadios(res.data); setIsLoadingRadios(false); })
      .catch((err) => { console.error(err); setIsLoadingRadios(false); });
  }, []);

  useEffect(() => {
    if (radios.length === 0) return;
    const savedId = localStorage.getItem(`selectedRadio-${band}`);
    if (!savedId) return;
    const saved = radios.find((r) => r.id === savedId);
    if (saved) setSelectedRadio(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radios]);

  const filteredRadios = useMemo(
    () => radios.filter((r) => r.band === band),
    [radios, band]
  );
  const filteredRadiosRef = useRef(filteredRadios);
  filteredRadiosRef.current = filteredRadios;

  useEffect(() => {
    document.title = selectedRadio ? `${selectedRadio.displayName} — Radio` : "Radio";
    if (!selectedRadio) return;
    localStorage.setItem(`selectedRadio-${band}`, selectedRadio.id);
  }, [selectedRadio, band]);

  function handleFrequencyChange(value: number) {
    const closest = resolveStationByTuning(value, filteredRadios, userLocation);
    setPreviewRadio(closest);
    setFrequency(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const fresh = resolveStationByTuning(value, filteredRadiosRef.current, userLocation);
      if (fresh) setSelectedRadio(fresh);
    }, 300);
  }

  function handleFrequencyRelease(value: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const station = resolveStationByTuning(value, filteredRadios, userLocation);
    setPreviewRadio(null);
    if (!station) return;
    setSelectedRadio(station);
    api.post(`/radios/click/${station.id}`).catch(() => {});
  }

  function changeBand(nextBand: Band) {
    setBand(nextBand);

    // Keep dial at same normalised position
    const pos = Math.max(0, Math.min(1,
      band === "FM" ? (frequency - 76) / 32 : (frequency - 530) / 1170
    ));
    const newFreq = nextBand === "FM"
      ? Math.min(108, Math.max(76, Math.round((76 + pos * 32) * 10) / 10))
      : Math.min(1700, Math.max(530, Math.round(530 + pos * 1170)));
    setFrequency(newFreq);

    const nextBandRadios = radios.filter((r) => r.band === nextBand);
    const closest = resolveStationByTuning(newFreq, nextBandRadios, userLocation);
    setSelectedRadio(closest);
  }

  return {
    frequency,
    band,
    selectedRadio,
    previewRadio,
    isTuning: previewRadio !== null,
    isLoadingRadios,
    handleFrequencyChange,
    handleFrequencyRelease,
    changeBand,
  };
}
