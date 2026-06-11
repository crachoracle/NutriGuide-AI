import { Router } from "express";
import { getRecommendations } from "../services/ai/recommendationService.js";

const router = Router();

router.post("/recommendations", async (req, res, next) => {
  try {
    const { menuText, dietaryProfile, allergyOptions = [] } = req.body || {};

    if (!menuText || !dietaryProfile) {
      return res.status(400).json({
        error: "menuText and dietaryProfile are required."
      });
    }

    const recommendations = await getRecommendations({
      menuText,
      dietaryProfile,
      allergyOptions
    });

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

export default router;
