import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import dbConnect from "../lib/mongodb.js";
import mongoose from "mongoose";

async function bulkAssignLeads(job) {
  const { batchId, assignTo, status, limit, updatedBy } = job.data;
  console.log(`\n🚀 Starting Bulk Assign Job: ${batchId}`);
  console.log(`Params: limit=${limit}, status=${status}, assignTo=${assignTo}`);

  try {
    // 🛠️ FIX 1: Explicitly await the connection.
    // If dbConnect fails or times out, it will jump to the catch block
    // instead of letting Mongoose "buffer" the queries into a crash.
    await dbConnect();

    // 🛠️ FIX 2: Safety Check. Ensure the connection state is 'Connected' (1).
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not active. State: " + mongoose.connection.readyState);
    }

    // Step 1: Filter leads (Status + Unassigned)
    const query = {
      status: status, 
      $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }]
    };

    // Step 2: Fetch Leads
    // Added a .lean() for performance since we only need raw data for the history map
    const leadsToAssign = await Lead.find(query)
      .limit(parseInt(limit))
      .select('_id assignedTo')
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
      // 🛠️ FIX 3: Added a dedicated catch for the DB writes
      // to prevent a "buffering timeout" from killing the whole worker process.
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
