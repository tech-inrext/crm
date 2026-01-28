import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import dbConnect from "../../lib/mongodb.js";
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

    const revertByObjectId = new mongoose.Types.ObjectId(revertedBy);
    const revertOps = [];
    const newHistoryEntries = [];
    const timestamp = new Date();

    for (const record of historyRecords) {
      // 🛠️ FIX: Normalize previousAssignedTo. If it's an empty string or null, use null.
      // Also ensure it is cast to an ObjectId if it exists.
      let targetAssignedTo = record.previousAssignedTo;
      if (targetAssignedTo === "" || !targetAssignedTo) {
        targetAssignedTo = null;
      } else {
        targetAssignedTo = new mongoose.Types.ObjectId(targetAssignedTo);
      }

      console.log(`Reverting Lead ${record.leadId}: ${record.newAssignedTo} -> ${targetAssignedTo}`);

      // Revert Lead to previousAssignedTo
      revertOps.push({
        updateOne: {
          filter: { _id: record.leadId },
          update: {
            $set: {
                assignedTo: targetAssignedTo,
                updatedBy: revertByObjectId,
                updatedAt: timestamp
            }
          }
        }
      });

      // Log the revert action
      newHistoryEntries.push({
        batchId, 
        leadId: record.leadId,
        previousAssignedTo: record.newAssignedTo, 
        newAssignedTo: targetAssignedTo, 
        updatedBy: revertByObjectId,
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
