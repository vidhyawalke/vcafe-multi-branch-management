import { Router } from "express";
import { getBranches, createBranch } from "../controllers/branchController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getBranches);
router.post("/", protect, adminOnly, createBranch);

export default router;
