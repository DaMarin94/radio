import { Router, Request, Response } from "express";
import {
  getBuenosAiresStations,
  getNearbyStations,
  getStationsByLocation,
} from "../services/radioService";

const router = Router();

router.get("/buenos-aires", async (_: Request, res: Response) => {
  try {
    const radios = await getBuenosAiresStations();
    res.json(radios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch radio stations" });
  }
});

router.get("/nearby", async (req: Request, res: Response) => {
  const { lat, lng, radiusKm } = req.query;

  if (!lat || !lng || !radiusKm) {
    res.status(400).json({ error: "lat, lng and radiusKm are required" });
    return;
  }

  try {
    const radios = await getNearbyStations(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat(radiusKm as string)
    );
    res.json(radios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch nearby stations" });
  }
});

router.get("/by-location", async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: "lat and lng are required" });
    return;
  }

  try {
    const result = await getStationsByLocation(
      parseFloat(lat as string),
      parseFloat(lng as string)
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stations by location" });
  }
});

export default router;
