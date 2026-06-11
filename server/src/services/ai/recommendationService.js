import { analyzeMenu } from "./mockRecommendationService.js";

// Provider boundary: replace this with an LLM or rules service when ready.
export async function getRecommendations(input) {
  return analyzeMenu(input);
}
