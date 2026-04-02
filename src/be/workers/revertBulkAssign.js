import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import Employee from "../models/Employee.js";
import LeadActivity from "../models/LeadActivity.js";
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
    const leadActivityEntries = [];
    const timestamp = new Date();

    // Step 1.5: Collect all unique employee IDs and fetch names for Activity Log
    const employeeIdsToFetch = new Set();
    historyRecords.forEach(r => {
      if (r.newAssignedTo) employeeIdsToFetch.add(r.newAssignedTo.toString());
      if (r.previousAssignedTo) employeeIdsToFetch.add(r.previousAssignedTo.toString());
    });

    const employees = await Employee.find({ _id: { $in: Array.from(employeeIdsToFetch) } })
      .select("name fullName")
      .lean();

    const employeeMap = {};
    employees.forEach(e => {
      employeeMap[e._id.toString()] = e.fullName || e.name || e._id.toString();
    });

    for (const record of historyRecords) {
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

      // Log Lead Activity
      const prevOwnerId = record.newAssignedTo ? record.newAssignedTo.toString() : null;
      const newOwnerId = targetAssignedTo ? targetAssignedTo.toString() : null;

      if (prevOwnerId !== newOwnerId) {
        const prevName = prevOwnerId ? (employeeMap[prevOwnerId] || prevOwnerId) : "";
        const newName = newOwnerId ? (employeeMap[newOwnerId] || newOwnerId) : "";
        leadActivityEntries.push({
          leadId: record.leadId,
          change: {
            assignedTo: { prev: prevName, new: newName }
          },
          updatedBy: revertByObjectId,
        });
      }
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

    // Save Lead Activity
    if (leadActivityEntries.length > 0) {
      await LeadActivity.insertMany(leadActivityEntries);
      console.log(`📝 Activity records created.`);
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
