import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import dbConnect from "../lib/mongodb.js";
import mongoose from "mongoose";

async function revertBulkAssign(job) {
  const { batchId, revertedBy } = job.data;
  console.log(`\nStart Revert Job for Batch: ${batchId}`);

  try {
    // 🛠️ Ensure DB Connection
    await dbConnect();

    // Safety Check
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not active. State: " + mongoose.connection.readyState);
    }

    // Fetch original assignment history for this batch
    // We only want to revert 'ASSIGN' actions.
    const historyParams = { batchId, actionType: "ASSIGN" };
    const historyRecords = await LeadAssignmentHistory.find(historyParams).lean();

    if (!historyRecords || historyRecords.length === 0) {
      console.log("No history records found for this batch.");
      return { success: false, message: "Batch not found or already reverted" };
    }

    console.log(`Found ${historyRecords.length} records to revert.`);

    const revertOps = [];
    const newHistoryEntries = [];
    const timestamp = new Date();

    for (const record of historyRecords) {
      // Revert Lead to previousAssignedTo
      revertOps.push({
        updateOne: {
          filter: { _id: record.leadId },
          update: {
            $set: {
                assignedTo: record.previousAssignedTo,
                updatedBy: revertedBy,
                updatedAt: timestamp
            }
          }
        }
      });

      // Log the revert action
      newHistoryEntries.push({
        batchId, // Maintain same batchId or create new one? User says "Store the revert operation...". 
                 // Keeping same batchId helps track the lifecycle of this batch.
        leadId: record.leadId,
        previousAssignedTo: record.newAssignedTo, // The one we are removing
        newAssignedTo: record.previousAssignedTo, // The one we are restoring
        updatedBy: revertedBy,
        actionType: "REVERT",
        timestamp
      });
    }

    // Execute Bulk Update on Leads
    if (revertOps.length > 0) {
      await Lead.bulkWrite(revertOps);
      console.log(`✅ Reverted ${revertOps.length} leads.`);
    }

    // Save Revert History
    if (newHistoryEntries.length > 0) {
      await LeadAssignmentHistory.insertMany(newHistoryEntries);
      console.log(`📜 Revert history logged.`);
    }

    return { success: true, count: revertOps.length };

  } catch (error) {
    console.error("❌ Error in revertBulkAssign execution context:");
    console.error(`- Error Name: ${error.name}`);
    console.error(`- Message: ${error.message}`);
    throw error;
  }
}

export default revertBulkAssign;
