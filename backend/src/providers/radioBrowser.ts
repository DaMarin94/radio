import axios from "axios";

// all.api.radio-browser.info resolves via round-robin DNS to an available server.
// Never hardcode a specific server (de1, de2, etc.) — they can go down.
const BASE_URL = "https://all.api.radio-browser.info/json";

const headers = { "User-Agent": "RadioApp/1.0" };

export async function getArgentinaStations() {
  return getStationsByCountry("AR");
}

export async function getStationsByCountry(countrycode: string) {
  const response = await axios.get(`${BASE_URL}/stations/search`, {
    headers,
    params: {
      countrycode,
      hidebroken: "true",
      is_https: "true",
      limit: 1000,
    },
  });

  return response.data;
}

export async function getStationsNear(
  lat: number,
  lng: number,
  radiusKm: number
) {
  const response = await axios.get(`${BASE_URL}/stations/search`, {
    headers,
    params: {
      geo_lat: lat,
      geo_long: lng,
      geo_distance: radiusKm * 1000, // API expects meters
      has_geo_info: "true",
      hidebroken: "true",
      is_https: "true",
      limit: 500,
    },
  });

  return response.data;
}

export async function clickStation(uuid: string): Promise<void> {
  await axios.get(`${BASE_URL}/url/${uuid}`, { headers });
}
