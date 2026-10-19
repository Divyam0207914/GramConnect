import mongoose from "mongoose";

const systemMetaSchema = new mongoose.Schema({
  _id: { type: String, default: "main" },
  globalHash: { type: String, default: "" },
  previousHash: { type: String, default: "" },
  hashHistory: [{
    hash: { type: String },
    timestamp: { type: Date, default: Date.now },
    version: { type: Number }
  }],
  version: { type: Number, default: 1 },
  totalComplaints: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("SystemMeta", systemMetaSchema);