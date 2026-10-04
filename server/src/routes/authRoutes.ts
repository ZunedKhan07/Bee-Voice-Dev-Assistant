import { Router } from "express";
import { verifyAdmin } from "../controllers/authController.js";

const router = Router();

// Endpoint: Verify Admin Password
router.post("/verify", verifyAdmin);

export default router;