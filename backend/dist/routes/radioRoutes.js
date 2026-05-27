"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const radioService_1 = require("../services/radioService");
const router = (0, express_1.Router)();
router.get("/buenos-aires", async (_, res) => {
    try {
        const radios = await (0, radioService_1.getBuenosAiresStations)();
        res.json(radios);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch radio stations",
        });
    }
});
exports.default = router;
//# sourceMappingURL=radioRoutes.js.map