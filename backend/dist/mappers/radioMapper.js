"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRadioStation = mapRadioStation;
const radioUtils_1 = require("../utils/radioUtils");
function mapRadioStation(station) {
    return {
        id: station.stationuuid,
        name: station.name
            .trim()
            .replace(/\s+/g, " "),
        streamUrl: station.url_resolved,
        favicon: station.favicon ?? null,
        homepage: station.homepage ?? null,
        country: station.country ?? null,
        state: station.state ?? null,
        tags: station.tags
            ? station.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        codec: station.codec ?? null,
        bitrate: station.bitrate ?? null,
        frequency: (0, radioUtils_1.extractFrequency)(station.name),
        band: (0, radioUtils_1.detectBand)(station.name),
    };
}
//# sourceMappingURL=radioMapper.js.map