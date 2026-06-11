import {
  addJournalEntry,
  getClinicianSummaryFromJournal,
  listJournalEntries
} from "../data/browserJournalStore.js";
import {
  getDemoDietaryProfiles,
  getDemoRecommendations,
  getDemoSampleMenu,
  runDemoOcr
} from "../services/browserDemoApi.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const USE_BROWSER_DEMO_API =
  import.meta.env.VITE_USE_BROWSER_DEMO_API === "true" ||
  (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function requestOrDemo(path, options, demoResolver) {
  if (USE_BROWSER_DEMO_API) {
    return demoResolver();
  }

  try {
    return await request(path, options);
  } catch (error) {
    if (error.status === 404 || error.name === "TypeError") {
      return demoResolver();
    }

    throw error;
  }
}

export function getDietaryProfiles() {
  return requestOrDemo("/dietary-profiles", {}, () => getDemoDietaryProfiles());
}

export function getSampleMenu() {
  return requestOrDemo("/sample-menu", {}, () => getDemoSampleMenu());
}

export function runOcr(payload) {
  return requestOrDemo(
    "/ocr",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    () => runDemoOcr(payload)
  );
}

export function getRecommendations(payload) {
  return requestOrDemo(
    "/recommendations",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    () => getDemoRecommendations(payload)
  );
}

export function getJournal() {
  return Promise.resolve(listJournalEntries());
}

export function saveJournalEntry(payload) {
  return Promise.resolve(addJournalEntry(payload));
}

export function getClinicianSummary() {
  return Promise.resolve(getClinicianSummaryFromJournal());
}
