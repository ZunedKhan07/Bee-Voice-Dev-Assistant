import { Router } from "express";
import {
  ingestLogOrVoice,
  getPendingIssues,
  updateIssue,
  pushToGitHub,
} from "../controllers/issueController.js";

const router = Router();

// Endpoint 1: Ingest log or voice transcript
router.post("/ingest", ingestLogOrVoice);

// Endpoint 2: Get all pending issues for dashboard
router.get("/pending", getPendingIssues);

// Endpoint 3: Update/Edit an issue card
router.put("/:issueId", updateIssue);

// Endpoint 4: Push an issue directly to GitHub
router.post("/:issueId/push", pushToGitHub);

export default router;