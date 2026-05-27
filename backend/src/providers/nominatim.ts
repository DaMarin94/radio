import axios from "axios";
import { ReverseGeocodeResult } from "../models/radioStation";

const BASE_URL = "https://nominatim.openstreetmap.org";

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  const response = await axios.get(`${BASE_URL}/reverse`, {
    params: {
      lat,
      lon: lng,
      format: "json",
      addressdetails: 1,
    },
    headers: {
      // Nominatim usage policy requires a descriptive User-Agent
      "User-Agent": "radio-app/1.0",
    },
  });

  const { address } = response.data;
  if (!address) return null;

  // Nominatim uses different keys depending on the place type
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.state;

  return {
    city,
    state: address.state || city,
    country: address.country,
    countrycode: (address.country_code as string).toUpperCase(),
  };
}
