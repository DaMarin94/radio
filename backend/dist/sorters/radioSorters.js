"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByBandAndFrequency = sortByBandAndFrequency;
function getBandPriority(band) {
    if (band === "AM")
        return 0;
    if (band === "FM")
        return 1;
    return 2;
}
function getFrequencyValue(frequency) {
    if (!frequency)
        return Number.MAX_SAFE_INTEGER;
    return parseFloat(frequency);
}
function sortByBandAndFrequency(a, b) {
    const bandDiff = getBandPriority(a.band) -
        getBandPriority(b.band);
    if (bandDiff !== 0) {
        return bandDiff;
    }
    return (getFrequencyValue(a.frequency) -
        getFrequencyValue(b.frequency));
}
//# sourceMappingURL=radioSorters.js.map