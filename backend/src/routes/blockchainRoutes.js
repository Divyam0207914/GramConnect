import express from "express";
import SystemMeta from "../models/systemMeta.model.js";
import { authenticate, requireRole, requireDesignation } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /update-hash
 * Updates the system hash in MongoDB.
 * Restricted to authenticated officials with Owner designation.
 */
router.post("/update-hash", authenticate, requireRole("official"), requireDesignation("Owner"), async (req, res) => {
  try {
    const { systemHash } = req.body;
    
    if (!systemHash) {
      return res.status(400).json({ 
        message: "systemHash is required in request body" 
      });
    }
    
    // Update MongoDB SystemMeta for tracking
    let systemMeta = await SystemMeta.findById("main");
    if (!systemMeta) {
      systemMeta = await SystemMeta.create({
        _id: "main",
        globalHash: systemHash,
        version: 1,
        lastUpdated: new Date()
      });
    } else {
      await SystemMeta.findByIdAndUpdate("main", {
        $set: {
          previousHash: systemMeta.globalHash,
          globalHash: systemHash,
          version: systemMeta.version + 1,
          lastUpdated: new Date()
        },
        $push: {
          hashHistory: {
            hash: systemMeta.globalHash,
            timestamp: systemMeta.lastUpdated,
            version: systemMeta.version
          }
        }
      });
    }
    
    res.status(200).json({
      message: "System hash updated successfully in MongoDB",
      systemHash: systemHash
    });
  } catch (error) {
    console.error("❌ Error updating system hash:", error);
    res.status(500).json({ 
      message: "Failed to update system hash", 
      error: error.message 
    });
  }
});

/**
 * GET /get-hash
 * Retrieves the current system hash from MongoDB
 */
router.get("/get-hash", authenticate, async (req, res) => {
  try {
    const systemMeta = await SystemMeta.findById("main");
    const systemHash = systemMeta?.globalHash || "0".repeat(64);
    
    res.status(200).json({
      message: "System hash retrieved successfully",
      systemHash: systemHash
    });
  } catch (error) {
    console.error("❌ Error retrieving system hash:", error);
    res.status(500).json({ 
      message: "Failed to retrieve system hash", 
      error: error.message 
    });
  }
});

export default router;