import { sampleMenu } from "../../data/sampleMenus.js";

export async function mockExtractMenuText(input = {}) {
  const useSample = Boolean(input.useSampleMenu || input.useSample);
  const uploadedText = String(input.uploadedText || input.menuText || "").trim();
  const uploadedFile = input.uploadedFile || null;
  const fileName = input.fileName || uploadedFile?.name || "uploaded menu";
  const fileType = uploadedFile?.type || "";

  if (useSample) {
    return {
      provider: "mock-ocr",
      source: "sample-menu",
      restaurantName: sampleMenu.restaurantName,
      menuName: sampleMenu.menuName,
      extractedText: sampleMenu.text,
      note:
        "Mock OCR returned the seeded sample menu. The OCR provider can be swapped with a real image or document extraction service later."
    };
  }

  if (uploadedFile) {
    return {
      provider: "mock-ocr",
      source: fileType.includes("pdf") ? "uploaded-pdf" : "uploaded-photo",
      restaurantName: "Uploaded Menu",
      menuName: fileName,
      extractedText: sampleMenu.text,
      note:
        `Mock OCR received ${fileName} (${fileType || "unknown file type"}) and returned realistic demo menu text. Replace this adapter with a real OCR provider to extract text from photos and PDFs.`
    };
  }

  if (!uploadedText) {
    return {
      provider: "mock-ocr",
      source: "mocked-upload",
      restaurantName: sampleMenu.restaurantName,
      menuName: sampleMenu.menuName,
      extractedText: sampleMenu.text,
      note:
        "Mock OCR did not receive readable text, so it returned the seeded sample menu. The OCR provider can be swapped with a real image or document extraction service later."
    };
  }

  return {
    provider: "mock-ocr",
    source: "uploaded-text",
    restaurantName: "Uploaded Menu",
    menuName: fileName,
    extractedText: uploadedText,
    note:
      "Mock OCR accepted the uploaded text as extracted menu content. A real OCR provider can replace this adapter later."
  };
}
