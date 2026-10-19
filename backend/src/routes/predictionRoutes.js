import express from "express";
import { configureCloudinary } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from "multer";

const router = express.Router();

// Configure Cloudinary when setting up routes
const cloudinary = configureCloudinary();

// Configure Cloudinary storage for prediction routes (fallback to memoryStorage)
const storage = cloudinary
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'prediction_images',
        format: async (req, file) => 'jpg',
        public_id: (req, file) => 'prediction_' + Date.now() + "_" + file.originalname.split('.')[0],
      },
    })
  : multer.memoryStorage();

const upload = multer({ storage });

// Prediction endpoint - returns default prediction (TensorFlow disabled)
router.post("/predict", upload.single("image"), async (req, res) => {
  try {
    // Return a default prediction since TensorFlow is disabled
    const labels = ["Garbage Issue", "Road Issue", "Water Issue", "Lighting Issue", "Other"];
    const defaultLabel = "Other";
    const defaultConfidence = "0.75";

    res.json({
      label: defaultLabel,
      confidence: defaultConfidence,
      note: "AI prediction disabled - returning default category"
    });
  } catch (err) {
    console.error("❌ Prediction error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;