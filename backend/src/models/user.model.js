import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["citizen"], default: "citizen" },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      block: { type: String, required: true },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    hash: { type: String, default: "" }, // current known system hash
    lastSynced: { type: Date, default: Date.now },
    pendingValidations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CommunityValidation" }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
