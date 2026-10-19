import express from "express";
import multer from "multer";
import { configureCloudinary } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  escalateComplaint,
  triggerAutoEscalation,
  getEligibleComplaints,
} from "../controllers/complaintController.js";
import { authenticate, requireRole, requireDesignation } from "../middleware/auth.js";

const router = express.Router();

// Configure Cloudinary when setting up routes
const cloudinary = configureCloudinary();

// Configure storage (Cloudinary if env configured, otherwise memoryStorage fallback)
const storage = cloudinary
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'complaint_images',
        format: async (req, file) => 'jpg',
        public_id: (req, file) => Date.now() + "_" + file.originalname.split('.')[0],
      },
    })
  : multer.memoryStorage();

// For processing images, use memory storage
const processImageStorage = multer.memoryStorage();
const processImageUpload = multer({ storage: processImageStorage });

const upload = multer({ storage });

// Process image endpoint - lightweight response without Python ML
router.post("/process-image", authenticate, processImageUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    res.json({
      title: "Civic Issue Report",
      description: "Photo attached for review",
      category: "other"
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, upload.single("image"), createComplaint);
router.get("/", authenticate, getComplaints);
router.get("/eligible-escalation", authenticate, requireRole("official"), getEligibleComplaints);
router.post("/auto-escalate", authenticate, requireRole("official"), requireDesignation("Owner"), triggerAutoEscalation);
router.put("/:id/status", authenticate, requireRole("official"), updateComplaintStatus);
router.put("/:id/escalate", authenticate, requireRole("official"), escalateComplaint);
router.put("/:id", authenticate, upload.single("image"), updateComplaint);
router.delete("/:id", authenticate, deleteComplaint);

export default router;