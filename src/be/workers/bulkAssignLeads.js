import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import dbConnect from "../../lib/mongodb.js";
import mongoose from "mongoose";

async function bulkAssignLeads(job) {
  const { batchId, assignTo, status, limit, updatedBy, availableCount, collectFrom, isAVP, isSystemAdmin } = job.data;
  console.log(`\n🚀 Starting Bulk Assign Job: ${batchId}`);
  console.log(`Params: limit=${limit}, status=${status}, collectFrom=${collectFrom}, assignTo=${assignTo}, isAVP=${isAVP}, isSystemAdmin=${isSystemAdmin}`);

  try {
    // 🛠️ FIX 1: Explicitly await the connection.
    await dbConnect();
    // 🛠️ FIX 2: Safety Check.
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not active. State: " + mongoose.connection.readyState);
    }

    // Step 1: Filter leads
    const statuses = Array.isArray(status) ? status : [status];
    const query = {
      status: { $in: statuses },
    };

    if (collectFrom === "unassigned") {
      query.$or = [{ assignedTo: null }, { assignedTo: { $exists: false } }];
      if (isSystemAdmin) {
        // System Admin can get all unassigned
      } else if (isAVP) {
        // AVP can only get unassigned leads managed by them
        query.managerId = updatedBy;
      } else {
        // Other users not allowed
        query._id = new mongoose.Types.ObjectId(); // Force 0 result
      }
    } else if (collectFrom === "me") {
      query.assignedTo = updatedBy;
    } else if (mongoose.Types.ObjectId.isValid(collectFrom)) {
      query.assignedTo = new mongoose.Types.ObjectId(collectFrom);
    } else {
      // Fallback
      query.uploadedBy = updatedBy;
      query.$or = [{ assignedTo: null }, { assignedTo: { $exists: false } }];
    }

    // 🛠️ FIX 3: Cast IDs
    const assignToId = new mongoose.Types.ObjectId(assignTo);
    const updatedById = new mongoose.Types.ObjectId(updatedBy);

    // Use the minimum of requested limit and known availability to keep things consistent
    const finalLimit = availableCount ? Math.min(parseInt(limit, 10), parseInt(availableCount, 10)) : parseInt(limit, 10);

    // Step 2: Fetch Leads
    const leadsToAssign = await Lead.find(query)
      .sort({ createdAt: 1 })
      .limit(finalLimit)
      .select("_id assignedTo")
      .lean();

    console.log(`Found ${leadsToAssign.length} leads to assign.`);

    if (leadsToAssign.length === 0) {
      console.log("No leads found matching criteria.");
      return { success: true, message: "No leads found", count: 0 };
    }

    const timestamp = new Date();
    const historyEntries = [];

    // Step 3: Prepare History Entries
    for (const lead of leadsToAssign) {
      historyEntries.push({
        batchId,
        leadId: lead._id,
        previousAssignedTo: lead.assignedTo || null,
        newAssignedTo: assignToId, // Start storing ObjectId
        updatedBy: updatedById,
        actionType: "ASSIGN",
        timestamp
      });
    }

    // Step 4: Bulk Update Leads
    const bulkOps = leadsToAssign.map(lead => {
      const updateDoc = {
        $set: {
          assignedTo: assignToId,
          updatedBy: updatedById,
          updatedAt: timestamp
        }
      };

      return {
        updateOne: {
          filter: { _id: lead._id },
          update: updateDoc
        }
      };
    });

    if (bulkOps.length > 0) {
      await Lead.bulkWrite(bulkOps);
      console.log(`✅ Successfully updated ${bulkOps.length} leads.`);
    }

    // Step 5: Save History
    if (historyEntries.length > 0) {
      await LeadAssignmentHistory.insertMany(historyEntries);
      console.log(`📜 History logs created.`);
    }

    return { success: true, count: leadsToAssign.length, batchId };

  } catch (error) {
    // 🛠️ FIX 4: Explicitly log the type of error (Timeout vs Logic)
    console.error("❌ Error in bulkAssignLeads execution context:");
    console.error(`- Error Name: ${error.name}`);
    console.error(`- Message: ${error.message}`);

    // We re-throw so BullMQ knows the job failed and can retry if configured
    throw error;
  }
}

export default bulkAssignLeads;
