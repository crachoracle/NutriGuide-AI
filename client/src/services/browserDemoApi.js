import {
  allergySubOptions,
  dietaryProfileGroups,
  findProfileById,
  getAllergyLabel,
  sampleMenu
} from "../data/demoData.js";

const keywordSets = {
  leanProtein: ["chicken", "salmon", "shrimp", "turkey", "tofu", "egg", "beans", "chickpeas", "steak", "fish"],
  plantForward: ["vegetable", "vegetables", "veggie", "salad", "beans", "chickpeas", "avocado", "tomato", "broccoli", "oatmeal", "berries", "quinoa"],
  healthyPrep: ["grilled", "roasted", "steamed", "olive oil", "lemon", "whole wheat", "brown rice", "quinoa"],
  friedHeavy: ["fried", "crispy", "breaded", "fries", "buffalo"],
  dairy: ["cheese", "parmesan", "cream", "alfredo", "butter", "ranch", "milk", "mozzarella", "feta", "cheddar", "swiss", "crema", "ice cream"],
  carbs: ["bread", "bun", "brioche", "pasta", "fettuccine", "rice", "tortilla", "wrap", "pizza", "crust", "fries", "croutons", "cornbread", "cake", "flour"],
  sugar: ["dessert", "cake", "lava", "sugar", "honey", "sweet", "barbecue", "bbq", "ice cream"],
  sodium: ["soup", "soy sauce", "buffalo", "bbq", "barbecue", "pickles", "cheese", "ribs", "sauce", "queso", "feta", "olives", "dressing"],
  gluten: ["bread", "bun", "brioche", "pasta", "breaded", "flour tortilla", "tortilla", "wrap", "pizza", "crust", "croutons", "soy sauce", "cake", "flour", "sourdough", "cornbread"],
  meat: ["chicken", "turkey", "beef", "steak", "pork", "bacon", "ham", "ribs"],
  seafood: ["salmon", "shrimp", "crab", "lobster", "scallop", "oyster", "clam", "anchovy", "fish"],
  pork: ["pork", "bacon", "ham", "pepperoni", "ribs"],
  eggs: ["egg", "eggs", "mayo", "aioli", "caesar", "cake", "breading"],
  nuts: ["peanut", "almond", "walnut", "pecan", "pesto", "nut", "nuts"],
  shellfish: ["shrimp", "crab", "lobster", "scallop", "oyster", "clam"],
  soy: ["soy sauce", "tofu", "edamame", "teriyaki", "miso", "soy-ginger", "soy"],
  sesame: ["sesame", "tahini", "hummus"]
};

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function clamp(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function parseMenuItems(menuText) {
  return menuText
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean)
    .filter((line) => !line.toLowerCase().includes("menu -") && !line.toLowerCase().endsWith("menu"))
    .map((line, index) => {
      const separator = line.includes(" - ") ? " - " : line.includes(":") ? ":" : null;
      if (!separator) return { id: `item-${index}`, name: line, description: "No description provided." };

      const [name, ...rest] = line.split(separator);
      return { id: `item-${index}`, name: name.trim(), description: rest.join(separator).trim() || "No description provided." };
    })
    .filter((item) => item.name.length > 2);
}

function categoryFor(score, forceAvoid, forceCaution) {
  if (forceAvoid) return "Avoid";
  if (forceCaution) return score >= 45 ? "Use Caution" : "Avoid";
  if (score >= 75) return "Best Choices";
  if (score >= 50) return "Use Caution";
  return "Avoid";
}

function fallbackModification(riskTags) {
  if (riskTags.includes("sugar")) return "Choose a smaller portion or swap for fruit or a vegetable-forward side.";
  if (riskTags.includes("refined carbs")) return "Substitute vegetables for fries, rice, pasta, bread, or tortillas.";
  if (riskTags.includes("fried foods")) return "Request grilled instead of fried if available.";
  if (riskTags.includes("dairy")) return "Ask whether the sauce contains dairy and request it on the side.";
  if (riskTags.includes("sodium")) return "Ask for sauce on the side and no added salt.";
  if (riskTags.includes("cross-contact risk")) return "Ask whether ingredients are prepared separately to avoid cross-contact.";
  return "Ask for dressing or sauces on the side and confirm ingredients before ordering.";
}

function analyzeItem(item, profileId, allergyOptions) {
  const text = `${item.name} ${item.description}`.toLowerCase();
  const reasons = [];
  const concerns = [];
  const riskTags = [];
  const assumptions = [
    "Assumption: Recommendation is based only on menu text, not exact nutrition facts or verified kitchen procedures."
  ];
  let score = 70;
  let forceAvoid = false;
  let forceCaution = false;

  if (hasAny(text, keywordSets.healthyPrep)) {
    score += 8;
    addUnique(reasons, "Uses a preparation style or ingredient pattern that is generally easier to fit into many dietary goals.");
  }
  if (hasAny(text, keywordSets.plantForward)) {
    score += 7;
    addUnique(reasons, "Includes vegetables, legumes, whole grains, or other plant-forward ingredients.");
  }
  if (hasAny(text, keywordSets.leanProtein)) {
    score += 6;
    addUnique(reasons, "Contains a recognizable protein source that can support satiety and meal balance.");
  }
  if (hasAny(text, keywordSets.friedHeavy)) {
    score -= 20;
    addUnique(concerns, "Fried or breaded preparation may be harder to align with heart-health, sodium, and glucose goals.");
    addUnique(riskTags, "fried foods");
  }
  if (hasAny(text, keywordSets.dairy)) {
    score -= 10;
    addUnique(concerns, "Creamy or cheese-heavy ingredients may add saturated fat and may not fit dairy-free needs.");
    addUnique(riskTags, "dairy");
  }
  if (hasAny(text, keywordSets.sugar)) {
    score -= 12;
    addUnique(concerns, "Sweet sauces or dessert ingredients may not fit low-sugar or diabetic-friendly goals.");
    addUnique(riskTags, "sugar");
  }

  const hasMeat = hasAny(text, keywordSets.meat);
  const hasSeafood = hasAny(text, keywordSets.seafood);
  const hasDairy = hasAny(text, keywordSets.dairy);
  const hasEgg = hasAny(text, keywordSets.eggs);
  const hasCarbs = hasAny(text, keywordSets.carbs);
  const hasGluten = hasAny(text, keywordSets.gluten);
  const hasPork = hasAny(text, keywordSets.pork);
  const hasSodium = hasAny(text, keywordSets.sodium);
  const hasPlantForward = hasAny(text, keywordSets.plantForward);
  const hasLeanProtein = hasAny(text, keywordSets.leanProtein);

  if (profileId === "omnivore" && hasPlantForward && hasLeanProtein) {
    score += 8;
    addUnique(reasons, "Looks like a balanced meal with protein and produce.");
  }
  if (profileId === "vegetarian" && (hasMeat || hasSeafood)) {
    score -= 55;
    forceAvoid = true;
    addUnique(concerns, "Contains meat, poultry, or seafood, which does not fit vegetarian guidance.");
  }
  if (profileId === "vegan" && (hasMeat || hasSeafood || hasDairy || hasEgg || text.includes("honey"))) {
    score -= 65;
    forceAvoid = true;
    addUnique(concerns, "Contains or may contain animal products such as meat, seafood, dairy, eggs, honey, or butter.");
  }
  if (profileId === "pescatarian" && hasMeat) {
    score -= 50;
    forceAvoid = true;
    addUnique(concerns, "Contains meat or poultry, which does not fit pescatarian guidance.");
  }
  if (["keto", "low-carb", "low-sugar"].includes(profileId) && hasCarbs) {
    score -= profileId === "keto" ? 35 : 25;
    addUnique(concerns, "Refined carbs, desserts, sweet sauces, or large starch portions may not fit this goal.");
    addUnique(riskTags, "refined carbs");
  }
  if (profileId === "low-sugar" && hasAny(text, keywordSets.sugar)) addUnique(riskTags, "sugar");
  if (profileId === "high-protein" && hasLeanProtein) {
    score += 16;
    addUnique(reasons, "The dish includes a clear protein source.");
  } else if (profileId === "high-protein") {
    score -= 18;
    addUnique(concerns, "No strong protein source is obvious from the menu description.");
  }
  if (profileId === "gluten-free" && hasGluten) {
    score -= 42;
    forceCaution = true;
    addUnique(concerns, "Contains likely gluten sources or ingredients commonly associated with gluten.");
    addUnique(riskTags, "gluten");
    addUnique(riskTags, "cross-contact risk");
  }
  if (profileId === "dairy-free" && hasDairy) {
    score -= 45;
    forceCaution = true;
    addUnique(concerns, "Contains likely dairy ingredients such as cheese, cream, butter, yogurt, or creamy sauce.");
  }
  if (profileId === "low-sodium" && hasSodium) {
    score -= 25;
    addUnique(concerns, "Sauces, cheese, soups, cured meats, fried foods, or pickled items may be higher in sodium.");
    addUnique(riskTags, "sodium");
  }
  if (profileId === "heart-healthy" && (hasSeafood || hasPlantForward || text.includes("olive oil"))) {
    score += 14;
    addUnique(reasons, "Fish, vegetables, legumes, whole grains, or olive oil align with heart-health goals.");
  }
  if (profileId === "halal") {
    assumptions.push("Halal status cannot be guaranteed from menu text alone.");
    if (hasPork) {
      score -= 70;
      forceAvoid = true;
      addUnique(concerns, "Pork is not compatible with halal guidance.");
      addUnique(riskTags, "pork");
    } else if (hasMeat) {
      score -= 18;
      forceCaution = true;
      addUnique(concerns, "Meat sourcing is unclear from the menu and should be treated as risk guidance, not a guarantee.");
    }
  }
  if (profileId === "kosher") {
    assumptions.push("Kosher status cannot be guaranteed from menu text alone.");
    if (hasPork || hasAny(text, keywordSets.shellfish)) {
      score -= 70;
      forceAvoid = true;
      addUnique(concerns, "Pork or shellfish is not compatible with kosher guidance.");
    } else {
      score -= 12;
      forceCaution = true;
      addUnique(concerns, "Kosher status and preparation cannot be verified from menu text alone.");
    }
  }

  if (allergyOptions.length) {
    for (const allergy of allergyOptions) {
      if (hasAny(text, keywordSets[allergy] || [])) {
        score -= 75;
        forceAvoid = true;
        addUnique(concerns, `Contains or may contain ${getAllergyLabel(allergy).toLowerCase()}, based on menu keywords.`);
        addUnique(riskTags, getAllergyLabel(allergy).toLowerCase());
      }
    }
    addUnique(riskTags, "cross-contact risk");
    assumptions.push("Allergy guidance is based on menu keywords and is not a safety guarantee.");
  }

  if (hasGluten) addUnique(riskTags, "gluten");
  if (hasSodium) addUnique(riskTags, "sodium");

  const finalScore = clamp(score);
  const category = categoryFor(finalScore, forceAvoid, forceCaution);

  return {
    id: item.id,
    dishName: item.name,
    description: item.description,
    category,
    score: finalScore,
    reasoning: reasons.length
      ? reasons.join(" ")
      : "This item can be evaluated from the menu text, but it does not show strong fit signals for the selected profile.",
    concerns: concerns.length ? concerns : ["No major concern keywords were detected from the menu text."],
    suggestedModification: fallbackModification(riskTags),
    assumptions,
    riskTags
  };
}

function groupRecommendations(recommendations) {
  return {
    bestChoices: recommendations.filter((item) => item.category === "Best Choices"),
    useCaution: recommendations.filter((item) => item.category === "Use Caution"),
    avoid: recommendations.filter((item) => item.category === "Avoid")
  };
}

export function getDemoDietaryProfiles() {
  return { groups: dietaryProfileGroups, allergySubOptions };
}

export function getDemoSampleMenu() {
  return sampleMenu;
}

export function runDemoOcr(input = {}) {
  const useSample = Boolean(input.useSampleMenu || input.useSample);
  const uploadedText = String(input.uploadedText || input.menuText || "").trim();
  const uploadedFile = input.uploadedFile || null;
  const uploadedFileMeta = input.uploadedFileMeta || null;
  const fileName = input.fileName || uploadedFile?.name || uploadedFileMeta?.name || "uploaded menu";
  const fileType = uploadedFile?.type || uploadedFileMeta?.type || "";

  if (useSample) {
    return {
      provider: "browser-demo-ocr",
      source: "sample-menu",
      restaurantName: sampleMenu.restaurantName,
      menuName: sampleMenu.menuName,
      extractedText: sampleMenu.text,
      note: "Demo OCR returned the seeded sample menu. The OCR provider can be swapped with a real image or document extraction service later."
    };
  }

  if (uploadedFile || uploadedFileMeta) {
    return {
      provider: "browser-demo-ocr",
      source: fileType.includes("pdf") ? "uploaded-pdf" : "uploaded-photo",
      restaurantName: "Uploaded Menu",
      menuName: fileName,
      extractedText: sampleMenu.text,
      note: `Demo OCR received ${fileName} (${fileType || "unknown file type"}) and returned realistic demo menu text. Replace this adapter with a real OCR provider to extract text from photos and PDFs.`
    };
  }

  if (!uploadedText) {
    return {
      provider: "browser-demo-ocr",
      source: "mocked-upload",
      restaurantName: sampleMenu.restaurantName,
      menuName: sampleMenu.menuName,
      extractedText: sampleMenu.text,
      note: "Demo OCR did not receive readable text, so it returned the seeded sample menu."
    };
  }

  return {
    provider: "browser-demo-ocr",
    source: "uploaded-text",
    restaurantName: "Uploaded Menu",
    menuName: fileName,
    extractedText: uploadedText,
    note: "Demo OCR accepted the uploaded text as extracted menu content."
  };
}

export function getDemoRecommendations({ menuText, dietaryProfile, allergyOptions = [] }) {
  const profile = findProfileById(dietaryProfile);
  const recommendations = parseMenuItems(menuText)
    .map((item) => analyzeItem(item, dietaryProfile, allergyOptions))
    .sort((a, b) => b.score - a.score);

  return {
    profile: profile || { id: dietaryProfile, label: dietaryProfile },
    allergyOptions: allergyOptions.map((id) => ({ id, label: getAllergyLabel(id) })),
    disclaimers: {
      medical:
        "NutriGuide AI provides dietary guidance only and is not medical advice. Users should consult a qualified medical professional for clinical decisions.",
      allergy:
        "Menu ingredients and preparation methods may vary. Users with allergies or strict dietary restrictions should confirm ingredients and cross-contact risks directly with the restaurant."
    },
    itemCount: recommendations.length,
    recommendations: groupRecommendations(recommendations)
  };
}
