import express from "express";
import User from "../models/user.model.js";
import SystemMeta from "../models/systemMeta.model.js";
import { getMismatchedUsersDetails } from "../utils/hashComparison.js";
import { detectTampering, verifyDatabaseIntegrity } from "../utils/tamperDetection.js";
import { getRecoveryOptions, restoreToHashState } from "../utils/dataRecovery.js";
import crypto from "crypto";
import { getSystemHash, setSystemHash } from "../../blockchain/service.js";

const router = express.Router();

// 🔄 Sync all users to the current system hash
router.post("/sync-hashes", async (req, res) => {
  try {
    // Get the current system hash from blockchain
    const currentSystemHash = await getSystemHash();
    
    if (!currentSystemHash) {
      return res.status(404).json({ message: "System hash not found on blockchain" });
    }
    
    // Update all users to match the current system hash
    const result = await User.updateMany(
      {}, 
      { 
        $set: { 
          hash: currentSystemHash, 
          lastSynced: new Date() 
        } 
      }
    );
    
    res.status(200).json({
      message: "All users synchronized to current system hash",
      systemHash: currentSystemHash,
      matchedUsers: result.matchedCount,
      modifiedUsers: result.modifiedCount
    });
  } catch (error) {
    console.error("❌ Error syncing hashes:", error);
    res.status(500).json({ 
      message: "Error syncing hashes", 
      error: error.message 
    });
  }
});

// 🔍 Get hash comparison report
router.get("/hash-report", async (req, res) => {
  try {
    // Get the current system hash from blockchain
    const currentSystemHash = await getSystemHash();
    
    if (!currentSystemHash) {
      return res.status(404).json({ message: "System hash not found on blockchain" });
    }
    
    console.log("📊 Hash Report Debug:");
    console.log("   System Hash:", currentSystemHash.substring(0, 16) + "...");
    
    // Get all users
    const users = await User.find({}, { name: 1, email: 1, hash: 1, lastSynced: 1 });
    console.log("   Total Users Found:", users.length);
    
    // Separate users with matching and mismatching hashes
    const matchingUsers = [];
    const mismatchingUsers = [];
    
    users.forEach(user => {
      console.log(`   User: ${user.name} (${user.email})`);
      console.log(`     User Hash: ${user.hash ? user.hash.substring(0, 16) + "..." : "NO HASH"}`);
      console.log(`     Match: ${user.hash === currentSystemHash}`);
      
      if (user.hash === currentSystemHash) {
        matchingUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          lastSynced: user.lastSynced
        });
      } else {
        mismatchingUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          userHash: user.hash,
          lastSynced: user.lastSynced
        });
      }
    });
    
    console.log("   ✅ Matching:", matchingUsers.length);
    console.log("   ❌ Mismatching:", mismatchingUsers.length);
    
    // Generate report
    const report = {
      systemHash: currentSystemHash,
      totalUsers: users.length,
      matchingUsers: matchingUsers.length,
      mismatchingUsers: mismatchingUsers.length,
      mismatchingUserDetails: mismatchingUsers,
      integrityStatus: mismatchingUsers.length === 0 ? "OK" : "COMPROMISED"
    };
    
    console.log("   Status:", report.integrityStatus);
    
    res.status(200).json({
      message: "Hash comparison report generated",
      report
    });
  } catch (error) {
    console.error("❌ Error generating hash report:", error);
    res.status(500).json({ 
      message: "Error generating hash report", 
      error: error.message 
    });
  }
});

// 🧐 Get detailed information about mismatched users
router.get("/mismatched-users", async (req, res) => {
  try {
    const mismatchedUsers = await getMismatchedUsersDetails();
    
    res.status(200).json({
      message: "Mismatched users details retrieved",
      count: mismatchedUsers.length,
      users: mismatchedUsers
    });
  } catch (error) {
    console.error("❌ Error getting mismatched users:", error);
    res.status(500).json({ 
      message: "Error getting mismatched users", 
      error: error.message 
    });
  }
});

// 🛠️ Sync specific user to system hash
router.post("/sync-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the current system hash from blockchain
    const currentSystemHash = await getSystemHash();
    
    if (!currentSystemHash) {
      return res.status(404).json({ message: "System hash not found on blockchain" });
    }
    
    // Update specific user to match the current system hash
    const result = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          hash: currentSystemHash, 
          lastSynced: new Date() 
        } 
      },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: "User synchronized to current system hash",
      user: {
        id: result._id,
        name: result.name,
        hash: result.hash,
        lastSynced: result.lastSynced
      }
    });
  } catch (error) {
    console.error("❌ Error syncing user:", error);
    res.status(500).json({ 
      message: "Error syncing user", 
      error: error.message 
    });
  }
});

// 🔎 Detect tampering in the system
router.get("/detect-tampering", async (req, res) => {
  try {
    const tamperResult = await detectTampering();
    
    res.status(200).json({
      message: "Tamper detection completed",
      result: tamperResult
    });
  } catch (error) {
    console.error("❌ Error detecting tampering:", error);
    res.status(500).json({ 
      message: "Error detecting tampering", 
      error: error.message 
    });
  }
});

// ✅ Verify database integrity against a specific hash
router.post("/verify-integrity", async (req, res) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({ message: "Hash is required" });
    }
    
    const verification = await verifyDatabaseIntegrity(hash);
    
    res.status(200).json({
      message: "Database integrity verification completed",
      verification
    });
  } catch (error) {
    console.error("❌ Error verifying integrity:", error);
    res.status(500).json({ 
      message: "Error verifying integrity", 
      error: error.message 
    });
  }
});

// 🔄 Get data recovery options
router.get("/recovery-options", async (req, res) => {
  try {
    const options = await getRecoveryOptions();
    
    res.status(200).json({
      message: "Recovery options retrieved",
      options
    });
  } catch (error) {
    console.error("❌ Error getting recovery options:", error);
    res.status(500).json({ 
      message: "Error getting recovery options", 
      error: error.message 
    });
  }
});

// 🛠️ Restore database to a specific hash state (conceptual)
router.post("/restore-to-hash", async (req, res) => {
  try {
    const { targetHash } = req.body;
    
    if (!targetHash) {
      return res.status(400).json({ message: "Target hash is required" });
    }
    
    const recoveryResult = await restoreToHashState(targetHash);
    
    res.status(200).json({
      message: "Data recovery process initiated",
      result: recoveryResult
    });
  } catch (error) {
    console.error("❌ Error during data recovery:", error);
    res.status(500).json({ 
      message: "Error during data recovery", 
      error: error.message 
    });
  }
});

// 🔧 Recalculate user hashes with current data (including location)
router.post("/recalculate-hashes", async (req, res) => {
  try {
    const users = await User.find({});
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    for (const user of users) {
      try {
        // Check if user has location data
        if (!user.location || !user.location.state || !user.location.district || !user.location.block) {
          // Skip users without complete location data
          skippedCount++;
          errors.push({
            userId: user._id,
            name: user.name,
            email: user.email,
            reason: "Missing location data - user needs to update their profile"
          });
          continue;
        }
        
        // Regenerate hash with current user data including location
        const userData = JSON.stringify({
          name: user.name,
          phone: user.phone,
          email: user.email,
          password: user.password, // Already hashed
          location: user.location
        });
        const newHash = crypto.createHash("sha256").update(userData).digest("hex");
        
        // Update user with new hash (without triggering validation)
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              hash: newHash,
              lastSynced: new Date()
            }
          }
        );
        updatedCount++;
      } catch (err) {
        errors.push({
          userId: user._id,
          name: user.name,
          error: err.message
        });
      }
    }
    
    res.status(200).json({
      message: "User hashes recalculation completed",
      totalUsers: users.length,
      updatedUsers: updatedCount,
      skippedUsers: skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("❌ Error recalculating hashes:", error);
    res.status(500).json({
      message: "Error recalculating hashes",
      error: error.message
    });
  }
});

// 🔍 Identify tampered complaints
router.get("/identify-tampered-complaints", async (req, res) => {
  try {
    const Complaint = (await import("../models/complaint.model.js")).default;
    const complaints = await Complaint.find({});
    
    const tamperedComplaints = [];
    
    console.log("🔍 Checking", complaints.length, "complaints for tampering...");
    
    for (const complaint of complaints) {
      // Calculate what the hash SHOULD be based on original data
      // Using the same format as complaint creation
      const complaintData = JSON.stringify({
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        submittedBy: complaint.submittedBy,
      });
      
      const calculatedHash = crypto.createHash("sha256").update(complaintData).digest("hex");
      
      console.log(`Checking complaint ${complaint._id}:`);
      console.log(`  Title: ${complaint.title}`);
      console.log(`  Stored hash: ${complaint.hash?.substring(0, 16)}...`);
      console.log(`  Calculated hash: ${calculatedHash.substring(0, 16)}...`);
      console.log(`  Match: ${complaint.hash === calculatedHash}`);
      
      // If stored hash doesn't match calculated hash, it's been tampered
      if (complaint.hash !== calculatedHash) {
        console.log("⚠️  TAMPERING DETECTED for complaint:", complaint._id);
        tamperedComplaints.push({
          id: complaint._id,
          title: complaint.title,
          description: complaint.description?.substring(0, 100) + "...",
          category: complaint.category,
          status: complaint.status,
          storedHash: complaint.hash?.substring(0, 16) + "...",
          calculatedHash: calculatedHash.substring(0, 16) + "...",
          submittedAt: complaint.createdAt,
          lastModified: complaint.updatedAt
        });
      }
    }
    
    console.log("📊 Tampering check complete. Found:", tamperedComplaints.length, "tampered complaints");
    
    res.status(200).json({
      message: "Tampered complaints identified",
      totalComplaints: complaints.length,
      tamperedCount: tamperedComplaints.length,
      tamperedComplaints: tamperedComplaints
    });
  } catch (error) {
    console.error("❌ Error identifying tampered complaints:", error);
    res.status(500).json({
      message: "Error identifying tampered complaints",
      error: error.message
    });
  }
});

// 🗑️ Remove tampered complaints and regenerate hash
router.post("/remove-tampered-complaints", async (req, res) => {
  try {
    const { complaintIds } = req.body;
    
    if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({ message: "Complaint IDs array is required" });
    }
    
    const Complaint = (await import("../models/complaint.model.js")).default;
    const CommunityValidation = (await import("../models/validation.model.js")).default;
    const User = (await import("../models/user.model.js")).default;
    
    // Get details of complaints before deletion for audit log and notifications
    const complaintsToDelete = await Complaint.find({ _id: { $in: complaintIds } });
    
    const deletionLog = complaintsToDelete.map(c => ({
      id: c._id,
      title: c.title,
      description: c.description,
      status: c.status,
      submittedBy: c.submittedBy,
      deletedAt: new Date()
    }));
    
    // Create notifications for affected users using validation model
    const notifications = [];
    const Official = (await import("../models/official.model.js")).default;
    const ownerOfficial = await Official.findOne({ designation: 'Owner' });
    
    if (!ownerOfficial) {
      console.warn("⚠️  No Owner official found. Cannot send notifications to users.");
      console.log("   Tip: Add designation: 'Owner' to an official in MongoDB");
    } else {
      console.log(`👑 Found Owner official: ${ownerOfficial.name} (${ownerOfficial._id})`);
    }
    
    for (const complaint of complaintsToDelete) {
      if (complaint.submittedBy) {
        if (!ownerOfficial) {
          console.warn(`   ⚠️  Skipping notification for user ${complaint.submittedBy} - no Owner found`);
          continue;
        }
        
        try {
          // Create a validation entry as notification with complaint snapshot
          const notification = await CommunityValidation.create({
            complaint: complaint._id,  // Will be null after deletion, but snapshot preserved
            requestedBy: ownerOfficial._id,
            targetUser: complaint.submittedBy,
            message: `⚠️ SYSTEM ALERT: Your complaint "${complaint.title}" was removed due to data tampering detected. This is a security measure to protect data integrity. If this was a legitimate complaint, please resubmit it through the complaint submission form. Original category: ${complaint.category}.`,
            status: 'pending',
            complaintSnapshot: {
              title: complaint.title,
              description: complaint.description,
              category: complaint.category,
              status: complaint.status
            }
          });
          
          // Add to user's pendingValidations array
          const updateResult = await User.updateOne(
            { _id: complaint.submittedBy },
            { $push: { pendingValidations: notification._id } }
          );
          
          console.log(`   ✅ Created notification ${notification._id} for user ${complaint.submittedBy}`);
          console.log(`      Updated user record:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'FAILED');
          notifications.push(notification);
        } catch (err) {
          console.error(`   ❌ Failed to create notification for user ${complaint.submittedBy}:`, err.message);
          console.error(`      Full error:`, err);
        }
      } else {
        console.warn(`   ⚠️  Complaint ${complaint._id} has no submittedBy field`);
      }
    }
    
    console.log(`📧 Created ${notifications.length} notifications for affected users`);
    
    // Delete the tampered complaints
    const deleteResult = await Complaint.deleteMany({ _id: { $in: complaintIds } });
    
    // Regenerate system hash with remaining complaints
    const remainingComplaints = await Complaint.find().sort({ _id: 1 });
    const complaintsData = JSON.stringify(
      remainingComplaints.map(c => ({
        id: c._id,
        title: c.title,
        description: c.description,
        category: c.category,
        submittedBy: c.submittedBy,
        hash: c.hash
      }))
    );
    
    const newGlobalHash = crypto.createHash("sha256").update(complaintsData).digest("hex");
    
    // Store the new hash on blockchain
    try {
      await setSystemHash(newGlobalHash);
      console.log("✅ New system hash stored on blockchain:", newGlobalHash);
    } catch (error) {
      console.error("❌ Failed to store new system hash on blockchain:", error);
      throw error;
    }
    
    // Also update MongoDB SystemMeta for redundancy and historical tracking
    try {
      let systemMeta = await SystemMeta.findById("main");
      if (!systemMeta) {
        systemMeta = await SystemMeta.create({
          _id: "main",
          globalHash: newGlobalHash,
          version: 1,
          lastUpdated: new Date()
        });
      } else {
        await SystemMeta.findByIdAndUpdate("main", {
          $set: {
            previousHash: systemMeta.globalHash,
            globalHash: newGlobalHash,
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
      console.log("✅ New system hash stored in MongoDB:", newGlobalHash);
    } catch (error) {
      console.error("❌ Failed to store new system hash in MongoDB:", error);
      // Don't throw error here as blockchain update was successful
    }
    
    console.log("🛡️ Tampered complaints removed:", deletionLog);
    
    res.status(200).json({
      message: "Tampered complaints removed and hash regenerated",
      deletedCount: deleteResult.deletedCount,
      deletedComplaints: deletionLog,
      notificationsSent: notifications.length,
      newGlobalHash: newGlobalHash.substring(0, 16) + "...",
      remainingComplaints: remainingComplaints.length
    });
  } catch (error) {
    console.error("❌ Error removing tampered complaints:", error);
    res.status(500).json({
      message: "Error removing tampered complaints",
      error: error.message
    });
  }
});

// 🔄 Recalculate all complaint hashes to new format
router.post("/recalculate-complaint-hashes", async (req, res) => {
  try {
    const Complaint = (await import("../models/complaint.model.js")).default;
    const complaints = await Complaint.find({});
    
    let updatedCount = 0;
    const errors = [];
    
    console.log("🔄 Recalculating hashes for", complaints.length, "complaints...");
    
    for (const complaint of complaints) {
      try {
        // Calculate new hash using reproducible data
        const complaintData = JSON.stringify({
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          submittedBy: complaint.submittedBy,
        });
        
        const newHash = crypto.createHash("sha256").update(complaintData).digest("hex");
        
        // Update the complaint hash
        await Complaint.updateOne(
          { _id: complaint._id },
          { $set: { hash: newHash } }
        );
        
        console.log(`  ✅ Updated hash for complaint: ${complaint._id}`);
        updatedCount++;
      } catch (err) {
        console.error(`  ❌ Error updating complaint ${complaint._id}:`, err.message);
        errors.push({
          complaintId: complaint._id,
          title: complaint.title,
          error: err.message
        });
      }
    }
    
    console.log(`✅ Hash recalculation complete. Updated: ${updatedCount}/${complaints.length}`);
    
    res.status(200).json({
      message: "Complaint hashes recalculated successfully",
      totalComplaints: complaints.length,
      updatedComplaints: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("❌ Error recalculating complaint hashes:", error);
    res.status(500).json({
      message: "Error recalculating complaint hashes",
      error: error.message
    });
  }
});

export default router;