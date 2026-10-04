import { Router } from "express";
import { askMentor } from "../controllers/mentorController.js";

const router = Router();

// Endpoint: Ask AI Mentor for guidance
router.post("/ask", askMentor);

export default router;