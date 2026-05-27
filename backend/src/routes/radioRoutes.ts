import { Router } from "express";
import { getBuenosAiresStations } from "../services/radioService";

const router = Router();

router.get("/buenos-aires", async (_, res) => {
  try {
    const radios = await getBuenosAiresStations();

    res.json(radios);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch radio stations",
    });
  }
});

export default router;