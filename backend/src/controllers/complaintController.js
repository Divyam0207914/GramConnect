import Complaint from "../models/complaint.model.js";
import crypto from "crypto";
import { updateComplaintsCollectionHash } from "../utils/hashUtils.js";
import { autoEscalateComplaints, getEligibleForEscalation } from "../services/autoEscalation.js";
import { configureCloudinary } from "../config/cloudinary.js";

export const createComplaint = async (req, res) => {
  const cloudinary = configureCloudinary();
  
  try {
    const title = req.body.title || 'Civic Issue Report';
    const description = req.body.description || 'No description provided';
    const category = req.body.category || 'other';

    // Strictly bind submittedBy to the authenticated user ID from JWT
    const submittedBy = req.user.id;

    // Parse location data if it comes as string (from FormData)
    let locationData = req.body.location;
    if (typeof locationData === 'string') {
      try {
        locationData = JSON.parse(locationData);
      } catch (e) {
        console.error('Failed to parse location:', e);
        locationData = {};
      }
    }

    // Generate unique hash for the complaint
    const complaintData = JSON.stringify({
      title,
      description,
      category,
      submittedBy,
    });
    const hash = crypto.createHash('sha256').update(complaintData).digest('hex');

    const complaint = await Complaint.create({
      title,
      description,
      submittedBy,
      category,
      image: req.file ? req.file.path : null,
      hash,
      location: locationData,
      currentLevel: "Block",
      status: "submitted",
    });

    res.status(201).json({
      message: `Complaint submitted successfully - Assigned to Block level`,
      predictedCategory: category,
      complaint,
    });

    try {
      await updateComplaintsCollectionHash();
    } catch (hashErr) {
      console.warn("Could not update collection hash:", hashErr.message);
    }
  } catch (err) {
    console.error("Complaint creation failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    let query = {};
    // Citizens can only view their own complaints
    if (req.user.role === "citizen") {
      query.submittedBy = req.user.id;
    } else if (req.query.userId) {
      // Officials can query by specific user
      query.submittedBy = req.query.userId;
    }

    const complaints = await Complaint.find(query).populate("submittedBy", "_id name email phone");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Complaint.findById(id);
    if (!existing) return res.status(404).json({ error: "Complaint not found" });

    // Verify ownership or official role
    const isOwner = existing.submittedBy.toString() === req.user.id;
    const isOfficial = req.user.role === "official";
    if (!isOwner && !isOfficial) {
      return res.status(403).json({ error: "Unauthorized. You cannot edit this complaint." });
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ["title", "description", "category"];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Complaint.findByIdAndUpdate(id, updateData, { new: true });

    let overallHash = null;
    try {
      overallHash = await updateComplaintsCollectionHash();
    } catch (hashErr) {
      console.warn("Could not update collection hash:", hashErr.message);
    }

    res.json({ message: "Complaint updated successfully", updated, overallHash });
  } catch (err) {
    console.error("Complaint update failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Closed status can only be set through community validation
    if (status === 'closed') {
      return res.status(400).json({ 
        error: "Status cannot be manually set to 'closed'. Complaints can only be closed through community validation." 
      });
    }
    
    const validStatuses = ['submitted', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Allowed statuses are: ${validStatuses.join(', ')}` 
      });
    }
    
    const complaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const overallHash = await updateComplaintsCollectionHash();

    res.json({ message: "Status updated", complaint, overallHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteComplaint = async (req, res) => {
  const cloudinary = configureCloudinary();
  
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // Direct object reference check: author or official only
    const isOwner = complaint.submittedBy.toString() === req.user.id;
    const isOfficial = req.user.role === "official";
    if (!isOwner && !isOfficial) {
      return res.status(403).json({ error: "Unauthorized. You cannot delete this complaint." });
    }

    if (complaint.image && cloudinary) {
      try {
        const urlParts = complaint.image.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await cloudinary.uploader.destroy(`complaint_images/${publicId}`);
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary:", err);
      }
    }

    await complaint.deleteOne();
    const overallHash = await updateComplaintsCollectionHash();

    res.json({ message: "Complaint deleted successfully", overallHash });
  } catch (err) {
    console.error("Complaint deletion failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const escalateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    let newLevel;
    if (complaint.currentLevel === "Block") {
      newLevel = "District";
    } else if (complaint.currentLevel === "District") {
      newLevel = "State";
    } else {
      return res.status(400).json({ error: "Complaint is already at the highest level" });
    }

    complaint.escalationHistory.push({
      from: complaint.currentLevel,
      to: newLevel,
      reason: reason || "Escalated by official"
    });
    
    complaint.currentLevel = newLevel;
    await complaint.save();

    res.json({ 
      message: `Complaint escalated from ${complaint.currentLevel} to ${newLevel}`,
      complaint
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const triggerAutoEscalation = async (req, res) => {
  try {
    const escalated = await autoEscalateComplaints();
    res.json({ 
      message: `Auto-escalation completed. ${escalated.length} complaints escalated.`,
      escalated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEligibleComplaints = async (req, res) => {
  try {
    const eligible = await getEligibleForEscalation();
    res.json(eligible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};