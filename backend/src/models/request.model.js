import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  // Reference to the complaint that this request is for (instead of post)
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  
  // The user who initiated this request
  initiatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // The proposed content changes
  proposedContent: { type: String, required: true },
  
  // Approvals from other users
  approvals: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      accepted: { type: Boolean }
    }
  ],
  
  // Status of the request
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  
  // When the request was created
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Request", requestSchema);