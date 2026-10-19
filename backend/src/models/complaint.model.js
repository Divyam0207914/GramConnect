import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["water", "electricity", "roads", "healthcare", "education", "other"],
      required: true
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      block: { type: String, required: true },
      address: { type: String },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    status: {
      type: String,
      enum: ["submitted", "in_progress", "resolved", "closed"],
      default: "submitted"
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    currentLevel: {
      type: String,
      enum: ["Block", "District", "State"],
      default: "Block"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Official",
      default: null
    },
    escalationHistory: [{
      from: String,
      to: String,
      escalatedAt: { type: Date, default: Date.now },
      reason: String
    }],
    communityValidated: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
      default: null,
    },
    hash: {
      type: String,
      unique: true,
      required: true
    },
  },
  { timestamps: true }
);

// Virtual field to calculate urgency based on time elapsed since creation
complaintSchema.virtual('urgency').get(function() {
  const now = new Date();
  const createdAt = this.createdAt;
  const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 3) {
    return 'low';
  } else if (daysDiff >= 3 && daysDiff < 7) {
    return 'medium';
  } else {
    return 'urgent';
  }
});

// Ensure virtual fields are included when converting to JSON
complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

export default mongoose.model("Complaint", complaintSchema);
