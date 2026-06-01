import axios from 'axios';
import type { RadioStation } from '@radio/shared';

const API_URL = import.meta.env.VITE_API_URL as string ?? 'https://radio-c868.onrender.com';

const api = axios.create({ baseURL: API_URL });

const STATIONS_CACHE_KEY = 'stations-cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type StationsCache = { data: RadioStation[]; timestamp: number };

export async function fetchStations(): Promise<RadioStation[]> {
  try {
    const result = await browser.storage.local.get(STATIONS_CACHE_KEY);
    const cached = result[STATIONS_CACHE_KEY] as StationsCache | undefined;
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
  } catch {}

  const { data } = await api.get<RadioStation[]>('/radios/buenos-aires');
  browser.storage.local.set({ [STATIONS_CACHE_KEY]: { data, timestamp: Date.now() } }).catch(() => {});
  return data;
}
