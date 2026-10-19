import express from "express";
import {
  createValidationRequest,
  submitValidation,
  getPendingValidations,
  getValidationStats
} from "../controllers/validationController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Official creates a validation request
router.post("/request", authenticate, requireRole("official"), createValidationRequest);

// User responds to a validation request
router.post("/respond", authenticate, submitValidation);

// Get pending validations for a user
router.get("/pending/:userId", authenticate, getPendingValidations);

// Get validation statistics for a complaint
router.get("/stats/:complaintId", authenticate, getValidationStats);

export default router;
