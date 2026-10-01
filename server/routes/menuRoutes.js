import { Router } from "express";
import { getMenu, createMenuItem } from "../controllers/menuController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getMenu);
router.post("/", protect, adminOnly, createMenuItem);

export default router;
