const JOURNAL_KEY = "nutriguide-ai:journal:v1";

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function readJournal() {
  const store = storage();
  if (!store) return [];

  try {
    const parsed = JSON.parse(store.getItem(JOURNAL_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJournal(entries) {
  const store = storage();
  if (!store) return;
  store.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function countBy(items, keyGetter) {
  return items.reduce((counts, item) => {
    const key = keyGetter(item);
    if (!key) return counts;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function topEntries(counts, limit = 5) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function listJournalEntries() {
  return readJournal().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export function addJournalEntry(payload) {
  if (!payload?.dishName || !payload?.dietaryProfile || typeof payload?.score !== "number") {
    throw new Error("dishName, dietaryProfile, and score are required to save a journal entry.");
  }

  const entry = {
    id: createId(),
    savedAt: new Date().toISOString(),
    restaurantName: payload.restaurantName || "Unknown restaurant",
    menuName: payload.menuName || "",
    dishName: payload.dishName,
    dietaryProfile: payload.dietaryProfile,
    dietaryProfileLabel: payload.dietaryProfileLabel || payload.dietaryProfile,
    allergyOptions: Array.isArray(payload.allergyOptions) ? payload.allergyOptions : [],
    allergyLabels: Array.isArray(payload.allergyLabels)
      ? payload.allergyLabels
      : Array.isArray(payload.allergyOptions)
        ? payload.allergyOptions
        : [],
    score: payload.score,
    category: payload.category,
    reasoning: payload.reasoning || "",
    concerns: Array.isArray(payload.concerns) ? payload.concerns : [],
    assumptions: Array.isArray(payload.assumptions) ? payload.assumptions : [],
    suggestedModification: payload.suggestedModification || "",
    riskTags: Array.isArray(payload.riskTags) ? payload.riskTags : [],
    notes: payload.notes || ""
  };

  const entries = readJournal();
  entries.push(entry);
  writeJournal(entries);
  return entry;
}

export function getClinicianSummaryFromJournal() {
  const entries = listJournalEntries();
  const totalMeals = entries.length;
  const averageScore =
    totalMeals === 0
      ? 0
      : Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / totalMeals);

  const profileCounts = countBy(entries, (entry) => entry.dietaryProfileLabel);
  const categoryCounts = countBy(entries, (entry) => entry.category);
  const allergyCounts = entries.reduce((counts, entry) => {
    for (const label of entry.allergyLabels || []) {
      counts[label] = (counts[label] || 0) + 1;
    }
    return counts;
  }, {});

  const concernCounts = entries.reduce((counts, entry) => {
    for (const concern of entry.concerns || []) {
      counts[concern] = (counts[concern] || 0) + 1;
    }
    return counts;
  }, {});

  const riskCounts = entries.reduce((counts, entry) => {
    for (const tag of entry.riskTags || []) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
    return counts;
  }, {});

  const mostCommonProfile = topEntries(profileCounts, 1)[0] || null;
  const commonRiskCategories = topEntries(riskCounts, 8);
  const commonConcerns = topEntries(concernCounts, 5);
  const categoryBreakdown = topEntries(categoryCounts, 3);

  const plainEnglishSummary =
    totalMeals === 0
      ? "No meals have been saved yet. Once dishes are saved, this summary will highlight recurring dietary patterns, risk flags, and decision quality for review."
      : `Across ${totalMeals} saved meal${totalMeals === 1 ? "" : "s"}, the average recommendation score is ${averageScore}. The most common profile is ${mostCommonProfile?.label || "not yet clear"}. Recurring risk areas include ${
          commonRiskCategories.map((item) => item.label).join(", ") || "no repeated risk categories"
        }. This summary is directional and should be reviewed alongside the user's clinical goals and restaurant-specific details.`;

  return {
    totalMeals,
    averageScore,
    mostCommonProfile,
    mostCommonAllergyOrRestrictionFlags: topEntries(allergyCounts, 5),
    commonConcerns,
    commonRiskCategories,
    categoryBreakdown,
    plainEnglishSummary,
    recentMeals: entries.slice(0, 5)
  };
}
