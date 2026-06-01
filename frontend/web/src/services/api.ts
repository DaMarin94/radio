import axios from "axios";
import type { RadioStation } from "@radio/shared";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
});

const STATIONS_CACHE_KEY = "stations-cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type StationsCache = { data: RadioStation[]; timestamp: number };

export async function fetchStations(params?: { lat: number; lng: number }): Promise<RadioStation[]> {
  try {
    const raw = localStorage.getItem(STATIONS_CACHE_KEY);
    if (raw) {
      const cached: StationsCache = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
    }
  } catch {}

  const { data } = await api.get<RadioStation[]>("/radios/buenos-aires", { params });
  try {
    localStorage.setItem(STATIONS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
  return data;
}