import { findProfileById, getAllergyLabel } from "../../data/dietaryProfiles.js";

const keywordSets = {
  leanProtein: [
    "grilled chicken",
    "chicken",
    "salmon",
    "shrimp",
    "turkey",
    "tofu",
    "egg",
    "eggs",
    "beans",
    "chickpeas",
    "black beans",
    "steak",
    "fish"
  ],
  plantForward: [
    "vegetable",
    "vegetables",
    "veggie",
    "salad",
    "legumes",
    "beans",
    "chickpeas",
    "avocado",
    "tomato",
    "broccoli",
    "oatmeal",
    "berries",
    "quinoa"
  ],
  healthyPrep: ["grilled", "roasted", "steamed", "olive oil", "lemon", "whole grain", "whole wheat", "brown rice", "quinoa"],
  friedHeavy: ["fried", "crispy", "breaded", "fries", "buffalo", "loaded"],
  creamyDairy: [
    "cheese",
    "parmesan",
    "cream",
    "creamy",
    "alfredo",
    "butter",
    "ranch",
    "yogurt",
    "milk",
    "mozzarella",
    "feta",
    "cheddar",
    "swiss",
    "crema",
    "ice cream"
  ],
  refinedCarbs: [
    "bread",
    "bun",
    "brioche",
    "pasta",
    "fettuccine",
    "rice",
    "white rice",
    "tortilla",
    "tortillas",
    "wrap",
    "pizza",
    "crust",
    "fries",
    "croutons",
    "cornbread",
    "cake",
    "flour"
  ],
  sugar: ["dessert", "cake", "lava", "sugar", "honey", "sweet", "barbecue", "bbq", "ice cream", "syrup"],
  sodium: [
    "bacon",
    "ham",
    "pepperoni",
    "soup",
    "soy sauce",
    "teriyaki",
    "miso",
    "buffalo",
    "bbq",
    "barbecue",
    "pickles",
    "cheese",
    "ribs",
    "sauce",
    "queso",
    "feta",
    "olives",
    "dressing"
  ],
  gluten: [
    "bread",
    "bun",
    "brioche",
    "pasta",
    "fettuccine",
    "breaded",
    "flour tortilla",
    "tortilla",
    "wrap",
    "pizza",
    "crust",
    "croutons",
    "soy sauce",
    "cake",
    "flour",
    "sourdough",
    "cornbread"
  ],
  meat: ["chicken", "turkey", "beef", "steak", "pork", "bacon", "ham", "ribs", "pepperoni"],
  poultry: ["chicken", "turkey"],
  seafood: ["salmon", "shrimp", "crab", "lobster", "scallop", "oyster", "clam", "anchovy", "fish"],
  pork: ["pork", "bacon", "ham", "pepperoni", "ribs"],
  eggs: ["egg", "eggs", "mayo", "aioli", "caesar", "cake", "breading"],
  alcohol: ["wine", "beer", "alcohol", "bourbon", "marsala"],
  legumes: ["beans", "black beans", "chickpeas", "hummus", "lentils", "soy", "tofu", "edamame"],
  nuts: ["peanut", "peanuts", "almond", "almonds", "cashew", "cashews", "walnut", "walnuts", "pecan", "pecans", "pesto", "satay", "nut", "nuts"],
  shellfish: ["shrimp", "crab", "lobster", "scallop", "oyster", "clam"],
  soy: ["soy sauce", "tofu", "edamame", "teriyaki", "miso", "soy-ginger", "soy"],
  sesame: ["sesame", "tahini", "hummus"]
};

const riskLabels = {
  fried: "fried foods",
  sodium: "sodium",
  sugar: "sugar",
  refinedCarbs: "refined carbs",
  dairy: "dairy",
  gluten: "gluten",
  nuts: "nuts",
  shellfish: "shellfish",
  eggs: "eggs",
  soy: "soy",
  sesame: "sesame",
  uncertifiedPrep: "non-certified preparation",
  crossContact: "cross-contact risk",
  pork: "pork",
  meatDairy: "meat-and-dairy combination"
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
      if (!separator) {
        return {
          id: `item-${index}`,
          name: line,
          description: "No description provided."
        };
      }

      const [name, ...rest] = line.split(separator);
      return {
        id: `item-${index}`,
        name: name.trim(),
        description: rest.join(separator).trim() || "No description provided."
      };
    })
    .filter((item) => item.name.length > 2);
}

function baseAnalysis(text, state) {
  if (hasAny(text, keywordSets.healthyPrep)) {
    state.score += 8;
    addUnique(state.reasons, "Uses a preparation style or ingredient pattern that is generally easier to fit into many dietary goals.");
  }

  if (hasAny(text, keywordSets.plantForward)) {
    state.score += 7;
    addUnique(state.reasons, "Includes vegetables, legumes, whole grains, or other plant-forward ingredients.");
  }

  if (hasAny(text, keywordSets.leanProtein)) {
    state.score += 6;
    addUnique(state.reasons, "Contains a recognizable protein source that can support satiety and meal balance.");
  }

  if (hasAny(text, keywordSets.friedHeavy)) {
    state.score -= 20;
    addUnique(state.concerns, "Fried or breaded preparation may be harder to align with heart-health, sodium, and glucose goals.");
    addUnique(state.riskTags, riskLabels.fried);
    state.modifications.push("Request grilled instead of fried if available.");
  }

  if (hasAny(text, keywordSets.creamyDairy)) {
    state.score -= 10;
    addUnique(state.concerns, "Creamy or cheese-heavy ingredients may add saturated fat and may not fit dairy-free needs.");
    addUnique(state.riskTags, riskLabels.dairy);
    state.modifications.push("Ask for cheese, cream sauce, or dressing on the side.");
  }

  if (hasAny(text, keywordSets.sugar)) {
    state.score -= 12;
    addUnique(state.concerns, "Sweet sauces or dessert ingredients may not fit low-sugar or diabetic-friendly goals.");
    addUnique(state.riskTags, riskLabels.sugar);
    state.modifications.push("Choose a smaller portion or swap for fruit or vegetables when possible.");
  }
}

function applyProfileRules(profileId, text, state) {
  const hasMeat = hasAny(text, keywordSets.meat);
  const hasSeafood = hasAny(text, keywordSets.seafood);
  const hasDairy = hasAny(text, keywordSets.creamyDairy);
  const hasEgg = hasAny(text, keywordSets.eggs);
  const hasCarbs = hasAny(text, keywordSets.refinedCarbs);
  const hasGluten = hasAny(text, keywordSets.gluten);
  const hasPork = hasAny(text, keywordSets.pork);
  const hasAlcohol = hasAny(text, keywordSets.alcohol);
  const hasSodium = hasAny(text, keywordSets.sodium);
  const hasPlantForward = hasAny(text, keywordSets.plantForward);
  const hasLeanProtein = hasAny(text, keywordSets.leanProtein);

  switch (profileId) {
    case "omnivore":
      if (hasPlantForward && hasLeanProtein) {
        state.score += 8;
        addUnique(state.reasons, "Looks like a balanced meal with protein and produce.");
      }
      break;

    case "vegetarian":
      if (hasMeat || hasSeafood) {
        state.score -= 55;
        state.forceAvoid = true;
        addUnique(state.concerns, "Contains meat, poultry, or seafood, which does not fit vegetarian guidance.");
      } else {
        state.score += 12;
        addUnique(state.reasons, "No obvious meat or seafood keywords were detected.");
      }
      state.assumptions.push("Confirm whether soups, sauces, or toppings use meat stock or bacon.");
      break;

    case "vegan":
      if (hasMeat || hasSeafood || hasDairy || hasEgg || text.includes("honey")) {
        state.score -= 65;
        state.forceAvoid = true;
        addUnique(state.concerns, "Contains or may contain animal products such as meat, seafood, dairy, eggs, honey, or butter.");
      } else {
        state.score += 10;
        addUnique(state.reasons, "No obvious animal-product keywords were detected.");
      }
      state.modifications.push("Ask whether sauces, breads, and dressings contain dairy, egg, honey, or butter.");
      break;

    case "pescatarian":
      if (hasMeat) {
        state.score -= 50;
        state.forceAvoid = true;
        addUnique(state.concerns, "Contains meat or poultry, which does not fit pescatarian guidance.");
      } else if (hasSeafood || hasPlantForward) {
        state.score += 12;
        addUnique(state.reasons, "Seafood or plant-forward ingredients can fit a pescatarian pattern.");
      }
      break;

    case "flexitarian":
      if (hasPlantForward) {
        state.score += 10;
        addUnique(state.reasons, "Plant-forward ingredients fit a flexitarian pattern.");
      }
      if (hasPork || text.includes("processed")) {
        state.score -= 14;
        addUnique(state.concerns, "Processed or pork-heavy items are less aligned with a plant-forward pattern.");
      }
      break;

    case "mediterranean":
      if (hasSeafood || text.includes("olive oil") || hasPlantForward || text.includes("quinoa")) {
        state.score += 14;
        addUnique(state.reasons, "Fish, olive oil, vegetables, legumes, or whole grains align well with Mediterranean-style eating.");
      }
      if (hasAny(text, keywordSets.friedHeavy) || hasDairy || hasPork) {
        state.score -= 14;
        addUnique(state.concerns, "Fried preparation, heavy cream, processed meats, or excessive cheese are less Mediterranean-aligned.");
      }
      break;

    case "keto":
      if (hasCarbs) {
        state.score -= 35;
        addUnique(state.concerns, "Bread, pasta, rice, tortillas, fries, dessert, or breading may exceed very low-carb goals.");
        addUnique(state.riskTags, riskLabels.refinedCarbs);
        state.modifications.push("Substitute vegetables for fries, rice, pasta, buns, or tortillas.");
      }
      if (hasLeanProtein && !hasCarbs) {
        state.score += 15;
        addUnique(state.reasons, "Protein-forward and lower-starch ingredients are more compatible with keto goals.");
      }
      break;

    case "low-carb":
      if (hasCarbs) {
        state.score -= 25;
        addUnique(state.concerns, "Refined carbs or large starch portions may not fit a low-carb goal.");
        addUnique(state.riskTags, riskLabels.refinedCarbs);
        state.modifications.push("Ask for vegetables or salad instead of fries, rice, tortillas, pasta, or bread.");
      }
      if (hasLeanProtein || hasPlantForward) {
        state.score += 8;
        addUnique(state.reasons, "Protein and produce can make this easier to adapt for lower-carb goals.");
      }
      break;

    case "high-protein":
      if (hasLeanProtein) {
        state.score += 16;
        addUnique(state.reasons, "The dish includes a clear protein source.");
      } else {
        state.score -= 18;
        addUnique(state.concerns, "No strong protein source is obvious from the menu description.");
        state.modifications.push("Add grilled chicken, salmon, shrimp, tofu, eggs, or legumes if appropriate.");
      }
      break;

    case "paleo":
      if (hasGluten || hasDairy || hasAny(text, keywordSets.legumes) || hasAny(text, keywordSets.sugar)) {
        state.score -= 28;
        addUnique(state.concerns, "Grains, dairy, legumes, refined sugar, or highly processed ingredients may not fit paleo guidance.");
      }
      if ((hasMeat || hasSeafood || hasEgg) && hasPlantForward) {
        state.score += 12;
        addUnique(state.reasons, "Protein plus vegetables can be adaptable for paleo if grains, dairy, and sauces are removed.");
      }
      state.modifications.push("Request no grains, dairy, legumes, or sugary sauces when possible.");
      break;

    case "gluten-free":
      if (hasGluten) {
        state.score -= 42;
        state.forceCaution = true;
        addUnique(state.concerns, "Contains likely gluten sources or ingredients commonly associated with gluten.");
        addUnique(state.riskTags, riskLabels.gluten);
        addUnique(state.riskTags, riskLabels.crossContact);
        state.modifications.push("Confirm gluten-free preparation and cross-contact controls with the restaurant.");
      } else {
        state.score += 8;
        addUnique(state.reasons, "No obvious gluten keywords were detected.");
      }
      break;

    case "dairy-free":
      if (hasDairy) {
        state.score -= 45;
        state.forceCaution = true;
        addUnique(state.concerns, "Contains likely dairy ingredients such as cheese, cream, butter, yogurt, or creamy sauce.");
        addUnique(state.riskTags, riskLabels.dairy);
        state.modifications.push("Ask for no cheese, no butter, and sauce or dressing on the side.");
      } else {
        state.score += 8;
        addUnique(state.reasons, "No obvious dairy keywords were detected.");
      }
      break;

    case "low-sodium":
      if (hasSodium) {
        state.score -= 25;
        addUnique(state.concerns, "Sauces, cheese, soups, cured meats, fried foods, or pickled items may be higher in sodium.");
        addUnique(state.riskTags, riskLabels.sodium);
        state.modifications.push("Ask for sauce on the side, no added salt, and a fresh vegetable side.");
      }
      if (hasPlantForward && !hasSodium) {
        state.score += 10;
        addUnique(state.reasons, "Fresh vegetables and simpler preparation may support lower-sodium choices.");
      }
      break;

    case "low-sugar":
      if (hasAny(text, keywordSets.sugar) || hasCarbs) {
        state.score -= 26;
        addUnique(state.concerns, "Desserts, sweet sauces, refined carbs, or large starch portions may affect glucose goals.");
        addUnique(state.riskTags, hasAny(text, keywordSets.sugar) ? riskLabels.sugar : riskLabels.refinedCarbs);
        state.modifications.push("Choose lean protein and non-starchy vegetables, and ask for sauces on the side.");
      }
      if ((hasLeanProtein || hasPlantForward) && !hasAny(text, keywordSets.sugar)) {
        state.score += 10;
        addUnique(state.reasons, "Protein and vegetables can support a more glucose-friendly meal pattern.");
      }
      break;

    case "heart-healthy":
      if (hasSeafood || hasPlantForward || text.includes("olive oil") || text.includes("whole grain")) {
        state.score += 14;
        addUnique(state.reasons, "Fish, vegetables, legumes, whole grains, or olive oil align with heart-health goals.");
      }
      if (hasAny(text, keywordSets.friedHeavy) || hasSodium || hasPork || hasDairy) {
        state.score -= 22;
        addUnique(state.concerns, "Fried foods, high-sodium sauces, processed meats, butter, cream, or excess cheese may be less heart-healthy.");
        if (hasSodium) addUnique(state.riskTags, riskLabels.sodium);
      }
      break;

    case "halal":
      if (hasPork || hasAlcohol) {
        state.score -= 70;
        state.forceAvoid = true;
        addUnique(state.concerns, "Pork or alcohol-based ingredients are not compatible with halal guidance.");
        addUnique(state.riskTags, riskLabels.pork);
      } else if (hasMeat || hasAny(text, keywordSets.poultry)) {
        state.score -= 18;
        state.forceCaution = true;
        addUnique(state.concerns, "Meat sourcing is unclear from the menu and should be treated as risk guidance, not a guarantee.");
        addUnique(state.riskTags, riskLabels.uncertifiedPrep);
        state.modifications.push("Confirm whether the meat is halal-certified and prepared separately.");
      } else if (hasSeafood || hasPlantForward) {
        state.score += 8;
        addUnique(state.reasons, "Seafood or vegetarian items may be easier to verify for halal needs, depending on preparation.");
      }
      state.assumptions.push("Halal status cannot be guaranteed from menu text alone.");
      break;

    case "kosher":
      if (hasPork || hasAny(text, keywordSets.shellfish)) {
        state.score -= 70;
        state.forceAvoid = true;
        addUnique(state.concerns, "Pork or shellfish is not compatible with kosher guidance.");
        if (hasPork) addUnique(state.riskTags, riskLabels.pork);
        if (hasAny(text, keywordSets.shellfish)) addUnique(state.riskTags, riskLabels.shellfish);
      } else if ((hasMeat || hasAny(text, keywordSets.poultry)) && hasDairy) {
        state.score -= 48;
        state.forceAvoid = true;
        addUnique(state.concerns, "The menu appears to combine meat and dairy, which is a kosher concern.");
        addUnique(state.riskTags, riskLabels.meatDairy);
      } else {
        state.score -= 12;
        state.forceCaution = true;
        addUnique(state.concerns, "Kosher status and preparation cannot be verified from menu text alone.");
        addUnique(state.riskTags, riskLabels.uncertifiedPrep);
        state.modifications.push("Confirm kosher certification and preparation with the restaurant.");
      }
      state.assumptions.push("Kosher status cannot be guaranteed from menu text alone.");
      break;

    default:
      break;
  }
}

function applyAllergyRules(allergyOptions, text, state) {
  if (!allergyOptions.length) return;

  const allergyMap = {
    nuts: keywordSets.nuts,
    shellfish: keywordSets.shellfish,
    eggs: keywordSets.eggs,
    soy: keywordSets.soy,
    sesame: keywordSets.sesame
  };

  let detectedAny = false;

  for (const allergy of allergyOptions) {
    const label = getAllergyLabel(allergy);
    if (hasAny(text, allergyMap[allergy] || [])) {
      detectedAny = true;
      state.score -= 75;
      state.forceAvoid = true;
      addUnique(state.concerns, `Contains or may contain ${label.toLowerCase()}, based on menu keywords.`);
      addUnique(state.riskTags, riskLabels[allergy] || label.toLowerCase());
      state.modifications.push(`Ask whether the dish contains ${label.toLowerCase()} and whether it can be prepared separately.`);
    }
  }

  addUnique(state.riskTags, riskLabels.crossContact);
  state.assumptions.push(
    detectedAny
      ? "Selected allergen keywords were detected. This is risk guidance, not a safety guarantee."
      : "No selected allergen keywords were detected, but ingredient lists and preparation methods may vary."
  );
  state.modifications.push("Ask whether ingredients are prepared separately to avoid cross-contact.");
}

function categorize(score, state) {
  if (state.forceAvoid) return "Avoid";
  if (state.forceCaution) return score >= 45 ? "Use Caution" : "Avoid";
  if (score >= 75) return "Best Choices";
  if (score >= 50) return "Use Caution";
  return "Avoid";
}

function fallbackModification(state) {
  if (state.riskTags.includes(riskLabels.sugar)) return "Choose a smaller portion or swap for fruit or a vegetable-forward side.";
  if (state.riskTags.includes(riskLabels.refinedCarbs)) return "Substitute vegetables for fries, rice, pasta, bread, or tortillas.";
  if (state.riskTags.includes(riskLabels.fried)) return "Request grilled instead of fried if available.";
  if (state.riskTags.includes(riskLabels.dairy)) return "Ask whether the sauce contains dairy and request it on the side.";
  if (state.riskTags.includes(riskLabels.sodium)) return "Ask for sauce on the side and no added salt.";
  if (state.riskTags.includes(riskLabels.crossContact)) return "Ask whether ingredients are prepared separately to avoid cross-contact.";
  if (state.modifications.length) return state.modifications[0];
  return "Ask for dressing or sauces on the side and confirm ingredients before ordering.";
}

function analyzeItem(item, profileId, allergyOptions) {
  const text = `${item.name} ${item.description}`.toLowerCase();
  const state = {
    score: 70,
    reasons: [],
    concerns: [],
    assumptions: [
      "Assumption: Recommendation is based only on menu text, not exact nutrition facts or verified kitchen procedures."
    ],
    modifications: [],
    riskTags: [],
    forceAvoid: false,
    forceCaution: false
  };

  baseAnalysis(text, state);
  applyProfileRules(profileId, text, state);
  applyAllergyRules(allergyOptions, text, state);

  if (hasAny(text, keywordSets.refinedCarbs)) addUnique(state.riskTags, riskLabels.refinedCarbs);
  if (hasAny(text, keywordSets.gluten)) addUnique(state.riskTags, riskLabels.gluten);
  if (hasAny(text, keywordSets.sodium)) addUnique(state.riskTags, riskLabels.sodium);

  const score = clamp(state.score);
  const category = categorize(score, state);

  return {
    id: item.id,
    dishName: item.name,
    description: item.description,
    category,
    score,
    reasoning:
      state.reasons.length > 0
        ? state.reasons.join(" ")
        : "This item can be evaluated from the menu text, but it does not show strong fit signals for the selected profile.",
    concerns:
      state.concerns.length > 0
        ? state.concerns
        : ["No major concern keywords were detected from the menu text."],
    suggestedModification: fallbackModification(state),
    assumptions: state.assumptions,
    riskTags: state.riskTags
  };
}

function groupRecommendations(recommendations) {
  return {
    bestChoices: recommendations.filter((item) => item.category === "Best Choices"),
    useCaution: recommendations.filter((item) => item.category === "Use Caution"),
    avoid: recommendations.filter((item) => item.category === "Avoid")
  };
}

export async function analyzeMenu({ menuText, dietaryProfile, allergyOptions = [] }) {
  const profile = findProfileById(dietaryProfile);
  const items = parseMenuItems(menuText);
  const recommendations = items
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
