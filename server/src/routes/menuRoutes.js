import { Router } from "express";
import { sampleMenu } from "../data/sampleMenus.js";
import { dietaryProfileGroups, allergySubOptions } from "../data/dietaryProfiles.js";
import { extractMenuText } from "../services/ocr/ocrService.js";

const router = Router();

router.get("/sample-menu", (_req, res) => {
  res.json(sampleMenu);
});

router.get("/dietary-profiles", (_req, res) => {
  res.json({
    groups: dietaryProfileGroups,
    allergySubOptions
  });
});

router.post("/ocr", async (req, res, next) => {
  try {
    const result = await extractMenuText(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
