import { getArgentinaStations } from "../providers/radioBrowser";

import {
  hasValidStream,
  isBuenosAiresStation,
  removeDuplicateStations,
} from "../filters/radioFilters";

import { mapRadioStation } from "../mappers/radioMapper";

import { sortByBandAndFrequency } from "../sorters/radioSorters";

import { RadioStation } from "../models/radioStation";

export async function getBuenosAiresStations(): Promise<RadioStation[]> {
  const stations = await getArgentinaStations();

  return stations
    .filter(isBuenosAiresStation)
    .filter(hasValidStream)
    .map(mapRadioStation)
    .filter(removeDuplicateStations)
    .sort(sortByBandAndFrequency);
}