import express from "express";
import {
  registerOfficial,
  loginOfficial,
  getDashboard,
  updateOfficial,
  deleteOfficial,
} from "../controllers/officialController.js";
import { authenticate, requireRole, requireDesignation } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerOfficial);
router.post("/login", loginOfficial);
router.get("/dashboard", authenticate, requireRole("official"), getDashboard);
router.put("/:id", authenticate, requireRole("official"), updateOfficial);
router.delete("/:id", authenticate, requireRole("official"), requireDesignation("Owner"), deleteOfficial);

export default router;
