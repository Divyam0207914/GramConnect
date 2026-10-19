import mongoose from "mongoose";

const officialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { 
      type: String, 
      enum: ["Block", "District", "State", "Owner"],
      required: true 
    },
    department: { type: String },
    location: {
      state: { type: String, required: true },
      district: { type: String },
      block: { type: String }
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Official", officialSchema);
