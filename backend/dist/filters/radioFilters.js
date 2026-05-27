"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBuenosAiresStation = isBuenosAiresStation;
exports.hasValidStream = hasValidStream;
exports.removeDuplicateStations = removeDuplicateStations;
function isBuenosAiresStation(station) {
    const state = station.state?.toLowerCase() || "";
    return state.includes("buenos aires");
}
function hasValidStream(station) {
    return Boolean(station.name &&
        station.url_resolved);
}
function removeDuplicateStations(station, index, self) {
    return (index ===
        self.findIndex((s) => s.name === station.name));
}
//# sourceMappingURL=radioFilters.js.map