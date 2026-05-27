"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgentinaStations = getArgentinaStations;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = "https://de1.api.radio-browser.info/json";
async function getArgentinaStations() {
    const response = await axios_1.default.get(`${BASE_URL}/stations/bycountry/Argentina`);
    return response.data;
}
//# sourceMappingURL=radioBrowser.js.map