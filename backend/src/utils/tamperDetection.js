import SystemMeta from "../models/systemMeta.model.js";
import Complaint from "../models/complaint.model.js";
import crypto from "crypto";

/**
 * Check if the database content matches the given hash
 * @param {String} hash - The hash to verify against
 * @returns {Object} Verification result
 */
export async function verifyDatabaseIntegrity(hash) {
  try {
    // Fetch all complaints (sorted for deterministic order)
    const complaints = await Complaint.find().sort({ _id: 1 });

    // Generate a hash from all complaints data
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

    const calculatedHash = crypto.createHash("sha256").update(complaintsData).digest("hex");

    return {
      isValid: calculatedHash === hash,
      calculatedHash,
      expectedHash: hash,
      complaintCount: complaints.length
    };
  } catch (error) {
    console.error("Error verifying database integrity:", error);
    throw error;
  }
}

/**
 * Check for tampering by comparing current database state with the blockchain hash
 * @returns {Object} Tamper detection result
 */
export async function detectTampering() {
  try {
    // Get the current system hash from MongoDB SystemMeta
    const systemMeta = await SystemMeta.findById("main");
    const currentSystemHash = systemMeta?.globalHash || "0".repeat(64);
    
    // Verify current database integrity against stored hash
    const currentVerification = await verifyDatabaseIntegrity(currentSystemHash);
    
    // Check against MongoDB stored hash for consistency
    let mongoDBVerification = currentVerification;
    if (systemMeta) {
      mongoDBVerification = await verifyDatabaseIntegrity(systemMeta.globalHash);
    }
    
    // Check against previous hash in MongoDB
    const previousVerification = systemMeta && systemMeta.previousHash ? 
      await verifyDatabaseIntegrity(systemMeta.previousHash) : null;
    
    // Check against historical hashes in MongoDB
    const historicalVerifications = [];
    if (systemMeta && systemMeta.hashHistory) {
      for (const history of systemMeta.hashHistory.slice(-5)) { // Check last 5
        const verification = await verifyDatabaseIntegrity(history.hash);
        historicalVerifications.push({
          hash: history.hash,
          timestamp: history.timestamp,
          version: history.version,
          isValid: verification.isValid
        });
      }
    }
    
    return {
      current: {
        hash: currentSystemHash,
        databaseValid: currentVerification.isValid,
        complaintCount: currentVerification.complaintCount,
        mongoDBHash: systemMeta ? systemMeta.globalHash : null,
        hashesMatch: systemMeta ? currentSystemHash === systemMeta.globalHash : false
      },
      previous: {
        hash: systemMeta ? systemMeta.previousHash : null,
        databaseValid: previousVerification ? previousVerification.isValid : false,
        complaintCount: previousVerification ? previousVerification.complaintCount : 0
      },
      historical: historicalVerifications,
      tamperingDetected: !currentVerification.isValid,
      recoverableToPrevious: previousVerification ? previousVerification.isValid : false,
      blockchainMongoDBConsistency: systemMeta ? currentSystemHash === systemMeta.globalHash : false
    };
  } catch (error) {
    console.error("Error detecting tampering:", error);
    throw error;
  }
}