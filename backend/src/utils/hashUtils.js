import crypto from "crypto";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import SystemMeta from "../models/systemMeta.model.js";

export async function updateComplaintsCollectionHash() {
  // 1️⃣ Fetch all complaints (sorted for deterministic order)
  const complaints = await Complaint.find().sort({ _id: 1 });

  // 2️⃣ Generate a hash from all complaints data
  const complaintsData = JSON.stringify(
    complaints.map(c => ({
      id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      submittedBy: c.submittedBy,
      hash: c.hash
    }))
  );

  const newHash = crypto.createHash("sha256").update(complaintsData).digest("hex");
  
  // 4️⃣ Also store the hash in MongoDB for redundancy and historical tracking
  try {
    let systemMeta = await SystemMeta.findById("main");
    if (!systemMeta) {
      systemMeta = await SystemMeta.create({
        _id: "main",
        globalHash: newHash,
        version: 1,
        lastUpdated: new Date()
      });
    } else {
      await SystemMeta.findByIdAndUpdate("main", {
        $set: {
          previousHash: systemMeta.globalHash,
          globalHash: newHash,
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
    console.log("✅ System hash stored in MongoDB:", newHash);
  } catch (error) {
    console.error("❌ Failed to store system hash in MongoDB:", error);
    // Don't throw error here as blockchain update was successful
  }

  // 5️⃣ Update all users' hash + lastSynced
  await User.updateMany({}, { $set: { hash: newHash, lastSynced: new Date() } });

  console.log("✅ System hash updated and stored in MongoDB:", newHash);
  console.log("🔁 All users synced to latest system hash");

  return newHash;
}