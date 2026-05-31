import axios from 'axios';
import type { RadioStation } from '@radio/shared';

const API_URL = import.meta.env.VITE_API_URL as string ?? 'https://radio-c868.onrender.com';

const api = axios.create({ baseURL: API_URL });

export async function fetchStations(): Promise<RadioStation[]> {
  const { data } = await api.get<RadioStation[]>('/radios/buenos-aires');
  return data;
}
