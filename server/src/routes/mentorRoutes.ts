import { Router } from "express";
import { ask } from "../controllers/mentorController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.post("/ask", rateLimit({ windowMs: 60000, max: 20, message: "Slow down a little, the mentor needs a moment." }), ask);

export default router;
