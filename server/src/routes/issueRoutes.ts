import { Router } from "express";
import { analyze, getOpenIssues, pushGithub } from "../controllers/issueController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.post("/analyze", rateLimit({ windowMs: 60000, max: 10, message: "Too many analyses. Wait a minute." }), analyze);
router.post("/push-github", rateLimit({ windowMs: 60000, max: 10, message: "Too many publishes. Wait a minute." }), pushGithub);
router.get("/open", getOpenIssues);

export default router;
