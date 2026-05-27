"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuenosAiresStations = getBuenosAiresStations;
const radioBrowser_1 = require("../providers/radioBrowser");
const radioFilters_1 = require("../filters/radioFilters");
const radioMapper_1 = require("../mappers/radioMapper");
const radioSorters_1 = require("../sorters/radioSorters");
async function getBuenosAiresStations() {
    const stations = await (0, radioBrowser_1.getArgentinaStations)();
    return stations
        .filter(radioFilters_1.isBuenosAiresStation)
        .filter(radioFilters_1.hasValidStream)
        .map(radioMapper_1.mapRadioStation)
        .filter(radioFilters_1.removeDuplicateStations)
        .sort(radioSorters_1.sortByBandAndFrequency);
}
//# sourceMappingURL=radioService.js.map