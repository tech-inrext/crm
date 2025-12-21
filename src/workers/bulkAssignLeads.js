import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import dbConnect from "../lib/mongodb.js";
import mongoose from "mongoose";

async function bulkAssignLeads(job) {
  const { batchId, assignTo, status, limit, updatedBy } = job.data;
  console.log(`\n🚀 Starting Bulk Assign Job: ${batchId}`);
  console.log(`Params: limit=${limit}, status=${status}, assignTo=${assignTo}`);

  await dbConnect();

  try {
    // Step 1: Filter leads (Status + Unassigned)
    const query = {
      status: status, 
      $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }]
    };

    // Step 2: Fetch Leads
    // distinct query to prevent multiple redundant fetches if concurrently running? 
    // But this is a worker, so sequential.
    const leadsToAssign = await Lead.find(query).limit(parseInt(limit)).select('_id assignedTo');

    console.log(`Found ${leadsToAssign.length} leads to assign.`);

    if (leadsToAssign.length === 0) {
      console.log("No leads found matching criteria.");
      return { success: true, message: "No leads found", count: 0 };
    }

    const leadIds = leadsToAssign.map(l => l._id);
    const historyEntries = [];
    const timestamp = new Date();

    // Step 3: Prepare History Entries
    for (const lead of leadsToAssign) {
      historyEntries.push({
        batchId,
        leadId: lead._id,
        previousAssignedTo: lead.assignedTo || null,
        newAssignedTo: assignTo,
        updatedBy,
        actionType: "ASSIGN",
        timestamp
      });
    }

    // Step 4: Bulk Update Leads
    const bulkOps = leadsToAssign.map(lead => ({
      updateOne: {
        filter: { _id: lead._id },
        update: {
          $set: {
            assignedTo: assignTo,
            updatedBy: updatedBy,
            updatedAt: timestamp
          }
        }
      }
    }));

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
    console.error("❌ Error in bulkAssignLeads:", error);
    throw error;
  }
}

export default bulkAssignLeads;
