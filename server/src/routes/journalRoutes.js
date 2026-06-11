import { Router } from "express";
import {
  addJournalEntry,
  getClinicianSummary,
  listJournalEntries
} from "../data/journalStore.js";

const router = Router();

router.get("/journal", async (_req, res, next) => {
  try {
    res.json(await listJournalEntries());
  } catch (error) {
    next(error);
  }
});

router.post("/journal", async (req, res, next) => {
  try {
    const entry = await addJournalEntry(req.body || {});
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.get("/clinician-summary", async (_req, res, next) => {
  try {
    res.json(await getClinicianSummary());
  } catch (error) {
    next(error);
  }
});

export default router;
