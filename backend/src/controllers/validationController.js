import CommunityValidation from "../models/validation.model.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import Official from "../models/official.model.js";
import { updateComplaintsCollectionHash } from "../utils/hashUtils.js";

const validation_threshold = 3;

// Official creates a validation request for a user
export const createValidationRequest = async (req, res) => {
  try {
    const { complaintId, targetUserId, message } = req.body;
    // Bind requestedBy strictly to the authenticated official's ID
    const officialId = req.user.id;

    // Verify complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Verify user exists
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ message: "Target user not found" });

    // Check if validation request already exists
    const existing = await CommunityValidation.findOne({ 
      complaint: complaintId, 
      targetUser: targetUserId 
    });
    if (existing) {
      return res.status(400).json({ message: "Validation request already exists for this user" });
    }

    // Create validation request
    const validation = await CommunityValidation.create({
      complaint: complaintId,
      requestedBy: officialId,
      targetUser: targetUserId,
      message: message || "Please validate this complaint",
      status: "pending"
    });

    // Add to user's pending validations
    await User.findByIdAndUpdate(targetUserId, {
      $push: { pendingValidations: validation._id }
    });

    res.status(201).json({ 
      message: "Validation request sent to user", 
      validation 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User responds to a validation request
export const submitValidation = async (req, res) => {
  try {
    const { validationId, response, comments } = req.body;
    // Strictly derive respondent ID from verified JWT session token
    const userId = req.user.id;

    // Find validation request
    const validation = await CommunityValidation.findById(validationId);
    if (!validation) return res.status(404).json({ message: "Validation request not found" });

    // Verify this validation is explicitly addressed to the calling user
    if (validation.targetUser.toString() !== userId) {
      return res.status(403).json({ message: "This validation request is not for you" });
    }

    // Check if already responded
    if (validation.status !== "pending") {
      return res.status(400).json({ message: "You already responded to this request" });
    }

    // Update validation with user's response
    validation.userResponse = response;
    validation.userComments = comments;
    validation.status = response === "approve" ? "approved" : "rejected";
    await validation.save();

    // Remove from user's pending validations
    await User.findByIdAndUpdate(userId, {
      $pull: { pendingValidations: validationId }
    });

    // Check if complaint exists
    const complaintId = validation.complaint;
    const complaint = complaintId ? await Complaint.findById(complaintId) : null;
    
    if (!complaint) {
      return res.status(200).json({ 
        message: "Notification acknowledged", 
        validation,
        isNotification: true
      });
    }
    
    const isSubmitter = complaint.submittedBy.toString() === userId;

    // Count approvals for this complaint
    const approvals = await CommunityValidation.countDocuments({ 
      complaint: complaintId, 
      userResponse: "approve" 
    });
    
    let thresholdReached = false;
    let validationReason = null;
    
    // VALIDATION LOGIC:
    // 1. If the verified complaint submitter approves -> INSTANT VALIDATION
    // 2. Otherwise, if 3 or more users approve -> MAJORITY VALIDATION
    if (isSubmitter && response === "approve") {
      const updatedComplaint = await Complaint.findByIdAndUpdate(complaintId, { 
        communityValidated: true, 
        status: "closed" 
      }, { new: true });
      
      thresholdReached = true;
      validationReason = "Complaint submitter approved (instant validation)";
      await updateComplaintsCollectionHash();
    } else if (approvals >= validation_threshold) {
      const updatedComplaint = await Complaint.findByIdAndUpdate(complaintId, { 
        communityValidated: true, 
        status: "closed" 
      }, { new: true });
      
      thresholdReached = true;
      validationReason = `Majority validation: ${approvals} users approved (threshold: ${validation_threshold})`;
      await updateComplaintsCollectionHash();
    }

    res.status(200).json({ 
      message: "Validation response submitted", 
      validation,
      totalApprovals: approvals,
      isSubmitter: isSubmitter,
      thresholdReached: thresholdReached,
      validationReason: validationReason
    });
  } catch (err) {
    console.error("ERROR in submitValidation:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get pending validations for a user
export const getPendingValidations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Direct object reference check: user can only view their own pending validations unless official
    if (req.user.id !== userId && req.user.role !== "official") {
      return res.status(403).json({ message: "Unauthorized. You cannot view other users' pending validations." });
    }

    // Find the user
    const user = await User.findById(userId).populate({
      path: 'pendingValidations',
      populate: [
        { path: 'complaint' },
        { path: 'requestedBy', select: '_id name department designation' }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Pending validations fetched successfully",
      validations: user.pendingValidations
    });
  } catch (err) {
    console.error("Error fetching pending validations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get validation statistics for a complaint
export const getValidationStats = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const totalValidations = await CommunityValidation.countDocuments({ complaint: complaintId });
    const approvals = await CommunityValidation.countDocuments({ complaint: complaintId, userResponse: "approve" });
    const rejections = await CommunityValidation.countDocuments({ complaint: complaintId, userResponse: "reject" });
    const pending = await CommunityValidation.countDocuments({ complaint: complaintId, status: "pending" });

    res.status(200).json({
      complaintId,
      totalValidations,
      approvals,
      rejections,
      pending,
      threshold: validation_threshold,
      validated: complaint.communityValidated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
