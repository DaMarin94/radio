import axios from "axios";

const BASE_URL = "https://de1.api.radio-browser.info/json";

export async function getArgentinaStations() {
  const response = await axios.get(
    `${BASE_URL}/stations/bycountry/Argentina`
  );

  return response.data;
}