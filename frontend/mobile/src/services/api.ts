import axios from "axios";
import type { RadioStation } from "@radio/shared";

// Expo inlines EXPO_PUBLIC_* vars at build time. See .env / .env.example.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
});

/**
 * STUB. Mirrors the web's fetchStations but without caching for now.
 * The Buenos Aires endpoint returns the curated station list the dial uses.
 * TODO(mobile-v1): add AsyncStorage caching like the web's localStorage cache.
 */
export async function fetchStations(params?: {
  lat: number;
  lng: number;
}): Promise<RadioStation[]> {
  const { data } = await api.get<RadioStation[]>("/radios/buenos-aires", {
    params,
  });
  return data;
}
