import Complaint from "../models/complaint.model.js";
import { updateComplaintsCollectionHash } from "../utils/hashUtils.js";

/**
 * Auto-escalate complaints that have been at the same level for more than 10 days
 * and are not yet resolved or closed
 */
export const autoEscalateComplaints = async () => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Find complaints that:
    // 1. Are not resolved or closed
    // 2. Have been at current level for more than 10 days
    // 3. Are not already at State level
    const complaints = await Complaint.find({
      status: { $in: ['submitted', 'in_progress'] },
      currentLevel: { $in: ['Block', 'District'] },
      updatedAt: { $lt: tenDaysAgo }
    });

    let escalatedCount = 0;
    const escalationResults = [];

    for (const complaint of complaints) {
      // Check if complaint has been at this level for 10 days
      // If escalationHistory exists, use the last escalation date
      // Otherwise, use createdAt
      let levelStartDate = complaint.createdAt;
      
      if (complaint.escalationHistory && complaint.escalationHistory.length > 0) {
        const lastEscalation = complaint.escalationHistory[complaint.escalationHistory.length - 1];
        levelStartDate = lastEscalation.escalatedAt;
      }

      const daysSinceLastChange = Math.floor((new Date() - new Date(levelStartDate)) / (1000 * 60 * 60 * 24));

      if (daysSinceLastChange >= 10) {
        let newLevel;
        if (complaint.currentLevel === 'Block') {
          newLevel = 'District';
        } else if (complaint.currentLevel === 'District') {
          newLevel = 'State';
        }

        if (newLevel) {
          complaint.escalationHistory.push({
            from: complaint.currentLevel,
            to: newLevel,
            reason: `Auto-escalated after ${daysSinceLastChange} days without resolution`,
            escalatedAt: new Date()
          });

          complaint.currentLevel = newLevel;
          complaint.assignedTo = null;
          await complaint.save();

          escalatedCount++;
          escalationResults.push({
            complaintId: complaint._id,
            title: complaint.title,
            from: complaint.escalationHistory[complaint.escalationHistory.length - 1].from,
            to: newLevel,
            days: daysSinceLastChange
          });
        }
      }
    }

    // Update global hash after auto-escalations
    if (escalatedCount > 0) {
      await updateComplaintsCollectionHash();
    }

    console.log(`Auto-escalation completed: ${escalatedCount} complaints escalated`);
    return {
      success: true,
      escalatedCount,
      details: escalationResults
    };
  } catch (error) {
    console.error('Auto-escalation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get complaints eligible for auto-escalation (for monitoring/preview)
 */
export const getEligibleForEscalation = async () => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const complaints = await Complaint.find({
      status: { $in: ['submitted', 'in_progress'] },
      currentLevel: { $in: ['Block', 'District'] },
      updatedAt: { $lt: tenDaysAgo }
    }).populate('submittedBy');

    const eligible = [];

    for (const complaint of complaints) {
      let levelStartDate = complaint.createdAt;
      
      if (complaint.escalationHistory && complaint.escalationHistory.length > 0) {
        const lastEscalation = complaint.escalationHistory[complaint.escalationHistory.length - 1];
        levelStartDate = lastEscalation.escalatedAt;
      }

      const daysSinceLastChange = Math.floor((new Date() - new Date(levelStartDate)) / (1000 * 60 * 60 * 24));

      if (daysSinceLastChange >= 10) {
        eligible.push({
          complaint,
          daysAtCurrentLevel: daysSinceLastChange,
          willEscalateTo: complaint.currentLevel === 'Block' ? 'District' : 'State'
        });
      }
    }

    return eligible;
  } catch (error) {
    console.error('Error fetching eligible complaints:', error);
    throw error;
  }
};
