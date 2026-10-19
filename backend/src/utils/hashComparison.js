import User from "../models/user.model.js";
import Complaint from "../models/complaint.model.js";
import SystemMeta from "../models/systemMeta.model.js";
import { detectTampering } from "./tamperDetection.js";

/**
 * Compare hashes across all users and the system meta
 * @returns {Object} Report of hash comparison
 */
export async function compareAllHashes() {
  try {
    // Get the current system hash from MongoDB SystemMeta
    const systemMeta = await SystemMeta.findById("main");
    const currentSystemHash = systemMeta?.globalHash || "0".repeat(64);
    
    // Get all users
    const users = await User.find({}, { name: 1, hash: 1, lastSynced: 1 });
    
    // Separate users with matching and mismatching hashes
    const matchingUsers = [];
    const mismatchingUsers = [];
    
    users.forEach(user => {
      if (user.hash === currentSystemHash) {
        matchingUsers.push({
          id: user._id,
          name: user.name,
          lastSynced: user.lastSynced
        });
      } else {
        mismatchingUsers.push({
          id: user._id,
          name: user.name,
          userHash: user.hash,
          lastSynced: user.lastSynced
        });
      }
    });
    
    // Check for potential tampering - if all users have the same hash but it doesn't match system
    const allUsersHaveSameHash = users.length > 0 && 
      users.every(user => user.hash === users[0].hash) && 
      users[0].hash !== currentSystemHash;
    
    // Check for database tampering
    const tamperResult = await detectTampering();
    
    // Generate report
    const report = {
      timestamp: new Date(),
      systemHash: currentSystemHash,
      totalUsers: users.length,
      matchingUsers: matchingUsers.length,
      mismatchingUsers: mismatchingUsers.length,
      mismatchingUserDetails: mismatchingUsers,
      allUsersHaveSameHash,
      potentialTampering: allUsersHaveSameHash,
      tamperDetection: tamperResult,
      integrityStatus: mismatchingUsers.length === 0 ? "OK" : 
        (allUsersHaveSameHash || tamperResult.tamperingDetected ? "TAMPERED" : "COMPROMISED")
    };
    
    return report;
  } catch (error) {
    console.error("Error comparing hashes:", error);
    throw error;
  }
}

/**
 * Get detailed information about users with mismatched hashes
 * @returns {Array} Array of mismatched users with additional details
 */
export async function getMismatchedUsersDetails() {
  try {
    // Get the current system hash from MongoDB SystemMeta
    const systemMeta = await SystemMeta.findById("main");
    const currentSystemHash = systemMeta?.globalHash || "0".repeat(64);
    
    // Get all users with full document details
    const users = await User.find({});
    
    // Filter for users with mismatched hashes
    const mismatchedUsers = users.filter(user => user.hash !== currentSystemHash);
    
    return mismatchedUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      userHash: user.hash,
      systemHash: currentSystemHash,
      lastSynced: user.lastSynced,
      hashDifference: user.hash !== currentSystemHash
    }));
  } catch (error) {
    console.error("Error getting mismatched users details:", error);
    throw error;
  }
}

/**
 * Periodically check hashes and log results
 * @param {Number} intervalMinutes - How often to check in minutes
 */
export function startPeriodicHashCheck(intervalMinutes = 60) {
  console.log(`🔄 Starting periodic hash check every ${intervalMinutes} minutes`);
  
  // Run immediately
  runHashCheck();
  
  // Schedule periodic checks
  setInterval(async () => {
    await runHashCheck();
  }, intervalMinutes * 60 * 1000);
}

async function runHashCheck() {
  try {
    const report = await compareAllHashes();
    
    console.log("🔍 Hash Comparison Report:");
    console.log(`   Timestamp: ${report.timestamp}`);
    console.log(`   System Hash: ${report.systemHash.substring(0, 16)}...`);
    console.log(`   Total Users: ${report.totalUsers}`);
    console.log(`   Matching Users: ${report.matchingUsers}`);
    console.log(`   Mismatching Users: ${report.mismatchingUsers}`);
    console.log(`   Integrity Status: ${report.integrityStatus}`);
    
    if (report.mismatchingUsers > 0) {
      console.warn("⚠️  HASH MISMATCH DETECTED!");
      console.warn("   Affected users:", report.mismatchingUserDetails.map(u => u.name).join(", "));
      
      // Log additional details for debugging
      const mismatchedDetails = await getMismatchedUsersDetails();
      console.warn("   Detailed mismatch information:", JSON.stringify(mismatchedDetails, null, 2));
    }
    
    // Check for tampering
    if (report.tamperDetection && report.tamperDetection.tamperingDetected) {
      console.error("🚨 DATABASE TAMPERING DETECTED!");
      console.error("   Current database state does not match system hash");
      console.error("   Recoverable to previous state:", report.tamperDetection.recoverableToPrevious);
      
      // If recoverable to previous state, suggest recovery
      if (report.tamperDetection.recoverableToPrevious) {
        console.info("   💡 Recovery option: Restore database to previous hash state");
        console.info(`      Previous hash: ${report.tamperDetection.previous.hash.substring(0, 16)}...`);
      }
    }
  } catch (error) {
    console.error("❌ Error during periodic hash check:", error.message);
  }
}