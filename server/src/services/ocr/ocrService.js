import { mockExtractMenuText } from "./mockOcrService.js";

// Provider boundary: replace this function with a real OCR adapter later.
export async function extractMenuText(input) {
  return mockExtractMenuText(input);
}
