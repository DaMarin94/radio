"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFrequency = extractFrequency;
exports.detectBand = detectBand;
function extractFrequency(name) {
    const match = name.match(/(\d{2,4}(?:\.\d)?)/);
    return match ? match[1] : null;
}
function detectBand(name) {
    const upper = name.toUpperCase();
    if (upper.includes("AM"))
        return "AM";
    if (upper.includes("FM"))
        return "FM";
    const frequency = extractFrequency(name);
    if (!frequency)
        return null;
    const freq = parseFloat(frequency);
    if (freq >= 76 && freq <= 108)
        return "FM";
    if (freq >= 500 && freq <= 1700)
        return "AM";
    return null;
}
//# sourceMappingURL=radioUtils.js.map