import mongoose from "mongoose";

const validationSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: false  // Made optional for tamper removal notifications
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Official",
      required: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      default: "Please validate this complaint"
    },
    // Store complaint details for notifications when complaint is deleted
    complaintSnapshot: {
      title: String,
      description: String,
      category: String,
      status: String
    },
    userResponse: {
      type: String,
      enum: ["approve", "reject", null],
      default: null
    },
    userComments: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("CommunityValidation", validationSchema);
