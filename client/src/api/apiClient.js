import {
  addJournalEntry,
  getClinicianSummaryFromJournal,
  listJournalEntries
} from "../data/browserJournalStore.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export function getDietaryProfiles() {
  return request("/dietary-profiles");
}

export function getSampleMenu() {
  return request("/sample-menu");
}

export function runOcr(payload) {
  return request("/ocr", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getRecommendations(payload) {
  return request("/recommendations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
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
