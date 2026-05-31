import { useEffect, useMemo, useRef, useState } from "react";
import { fetchStations } from "../lib/api";
import type { RadioStation } from "@radio/shared";
import { resolveStationByTuning } from "@radio/shared";
import { getSavedFrequency } from "../helpers/getSavedFrequency";

type Band = "AM" | "FM";

export function useTuner() {
  const [radios, setRadios] = useState<RadioStation[]>([]);
  const [frequency, setFrequency] = useState<number>(() => {
    const savedBand = (localStorage.getItem("bandFilter") as Band) ?? "FM";
    return getSavedFrequency(savedBand);
  });
  const [selectedRadio, setSelectedRadio] = useState<RadioStation | null>(null);
  const [band, setBand] = useState<Band>(() =>
    localStorage.getItem("bandFilter") === "AM" ? "AM" : "FM"
  );
  const [previewRadio, setPreviewRadio] = useState<RadioStation | null>(null);
  const [isLoadingRadios, setIsLoadingRadios] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    localStorage.setItem(`frequency-${band}`, String(frequency));
    // intentional: `band` omitted — saves under whatever band is active at change time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency]);

  useEffect(() => {
    fetchStations()
      .then((stations) => { setRadios(stations); setIsLoadingRadios(false); })
      .catch((err) => { console.error(err); setIsLoadingRadios(false); });
  }, []);

  useEffect(() => {
    if (radios.length === 0) return;
    const savedId = localStorage.getItem(`selectedRadio-${band}`);
    if (!savedId) return;
    const saved = radios.find((r) => r.id === savedId);
    if (saved) setSelectedRadio(saved);
    // intentional: only runs on initial radios load, not on every band change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radios]);

  const filteredRadios = useMemo(
    () => radios.filter((r) => r.band === band),
    [radios, band]
  );
  const filteredRadiosRef = useRef(filteredRadios);
  filteredRadiosRef.current = filteredRadios;

  useEffect(() => {
    if (!selectedRadio) return;
    localStorage.setItem(`selectedRadio-${band}`, selectedRadio.id);
  }, [selectedRadio, band]);

  function handleFrequencyChange(value: number) {
    const closest = resolveStationByTuning(value, filteredRadios);
    setPreviewRadio(closest);
    setFrequency(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const fresh = resolveStationByTuning(value, filteredRadiosRef.current);
      if (fresh) setSelectedRadio(fresh);
    }, 300);
  }

  function handleFrequencyRelease(value: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const station = resolveStationByTuning(value, filteredRadios);
    setPreviewRadio(null);
    if (!station) return;
    setSelectedRadio(station);
  }

  function changeBand(nextBand: Band) {
    setBand(nextBand);
    localStorage.setItem("bandFilter", nextBand);

    const pos = Math.max(0, Math.min(1,
      band === "FM" ? (frequency - 76) / 32 : (frequency - 530) / 1170
    ));
    const newFreq = nextBand === "FM"
      ? Math.min(108, Math.max(76, Math.round((76 + pos * 32) * 10) / 10))
      : Math.min(1700, Math.max(530, Math.round(530 + pos * 1170)));
    setFrequency(newFreq);

    const nextBandRadios = radios.filter((r) => r.band === nextBand);
    const closest = resolveStationByTuning(newFreq, nextBandRadios);
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
