import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { findProfileById, getAllergyLabel } from "./dietaryProfiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storagePath = path.resolve(__dirname, "../../storage/journal.json");

async function ensureJournalFile() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  try {
    await fs.access(storagePath);
  } catch {
    await fs.writeFile(storagePath, "[]", "utf8");
  }
}

async function readJournal() {
  await ensureJournalFile();
  const raw = await fs.readFile(storagePath, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJournal(entries) {
  await ensureJournalFile();
  await fs.writeFile(storagePath, JSON.stringify(entries, null, 2), "utf8");
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

export async function listJournalEntries() {
  const entries = await readJournal();
  return entries.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export async function addJournalEntry(payload) {
  if (!payload?.dishName || !payload?.dietaryProfile || typeof payload?.score !== "number") {
    const error = new Error("dishName, dietaryProfile, and score are required to save a journal entry.");
    error.status = 400;
    throw error;
  }

  const profile = findProfileById(payload.dietaryProfile);
  const entry = {
    id: randomUUID(),
    savedAt: new Date().toISOString(),
    restaurantName: payload.restaurantName || "Unknown restaurant",
    menuName: payload.menuName || "",
    dishName: payload.dishName,
    dietaryProfile: payload.dietaryProfile,
    dietaryProfileLabel: profile?.label || payload.dietaryProfile,
    allergyOptions: Array.isArray(payload.allergyOptions) ? payload.allergyOptions : [],
    allergyLabels: Array.isArray(payload.allergyOptions)
      ? payload.allergyOptions.map(getAllergyLabel)
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

  const entries = await readJournal();
  entries.push(entry);
  await writeJournal(entries);
  return entry;
}

export async function getClinicianSummary() {
  const entries = await listJournalEntries();
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
