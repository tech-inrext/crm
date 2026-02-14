import Lead from "../models/Lead.js";
import LeadAssignmentHistory from "../models/LeadAssignmentHistory.js";
import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import dbConnect from "../../lib/mongodb.js";
import mongoose from "mongoose";

async function bulkAssignLeads(job) {
  const { batchId, assignTo, status, limit, updatedBy, availableCount } = job.data;
  console.log(`\n🚀 Starting Bulk Assign Job: ${batchId}`);
  console.log(`Params: limit=${limit}, status=${status}, assignTo=${assignTo}, availableCount=${availableCount}`);

  try {
    // 🛠️ FIX 1: Explicitly await the connection.
    await dbConnect();

    // 🛠️ FIX 2: Safety Check.
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not active. State: " + mongoose.connection.readyState);
    }

    // Step 1: Filter leads (Status + Unassigned + Uploaded by Me)
    const query = {
      status: status, 
      uploadedBy: updatedBy, // CRITICAL FIX: Only select leads uploaded by the user performing the assignment
      $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }]
    };

    // 🛠️ FIX 3: Cast IDs
    const assignToId = new mongoose.Types.ObjectId(assignTo);
    const updatedById = new mongoose.Types.ObjectId(updatedBy);

    // Use the minimum of requested limit and known availability to keep things consistent
    // If availableCount is missing (legacy jobs), fallback to limit
    const finalLimit = availableCount ? Math.min(parseInt(limit, 10), parseInt(availableCount, 10)) : parseInt(limit, 10);

    // Step 2: Fetch Leads
    // Added sort({ createdAt: 1 }) for FIFO assignment (oldest leads first)
    const leadsToAssign = await Lead.find(query)
      .sort({ createdAt: 1 }) 
      .limit(finalLimit)
      .select('_id assignedTo fullName phone location propertyType budgetRange leadId')
      .lean(); 

    console.log(`Found ${leadsToAssign.length} leads to assign.`);

    if (leadsToAssign.length === 0) {
      console.log("No leads found matching criteria.");
      return { success: true, message: "No leads found", count: 0 };
    }

    // Get assignee and assigner details
    const [assignee, assigner] = await Promise.all([
      Employee.findById(assignToId).select('name email').lean(),
      Employee.findById(updatedById).select('name email').lean()
    ]);

    if (!assignee) {
      throw new Error(`Assignee with ID ${assignTo} not found`);
    }

    const timestamp = new Date();
    const historyEntries = [];
    const notificationPromises = [];

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

      // Create notification for individual lead assignment
      notificationPromises.push(
        Notification.create({
          recipient: assignToId,
          sender: updatedById,
          type: "LEAD_ASSIGNED",
          title: `New Lead Assigned`,
          message: `Lead "${lead.fullName || lead.phone || 'Unnamed Lead'}" has been assigned to you by ${assigner?.name || 'System'}.`,
          metadata: {
            leadId: lead._id,
            leadName: lead.fullName || lead.phone || 'Unnamed Lead',
            leadPhone: lead.phone || 'N/A',
            leadLocation: lead.location || 'N/A',
            leadPropertyType: lead.propertyType || 'N/A',
            leadBudget: lead.budgetRange || 'N/A',
            actionUrl: `/dashboard/leads?openDialog=true&leadId=${lead._id}`,
            priority: "HIGH",
            isActionable: true,
            assignedBy: updatedById,
            assignedByName: assigner?.name || 'System',
            batchId: batchId
          },
          channels: {
            inApp: true,
            email: true,
          },
          lifecycle: {
            status: "DELIVERED",
            deliveredAt: timestamp,
          },
          timeRules: {
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          },
          cleanupRules: {
            canAutoDelete: true,
            preserveIfUnread: true,
            preserveIfActionable: true,
          }
        })
      );
    }
    

    // Step 4: Bulk Update Leads
    const bulkOps = leadsToAssign.map(lead => ({
      updateOne: {
        filter: { _id: lead._id },
        update: {
          $set: {
            assignedTo: assignToId, // Ensure ObjectId is stored
            updatedBy: updatedById,
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

    // Send individual notifications
    try {
      const notifications = await Promise.all(notificationPromises);
      console.log(`📢 Created ${notifications.length} individual lead notifications`);
    } catch (notificationError) {
      console.error("Failed to create some notifications:", notificationError);
    }

    // Step 5: Save History
    if (historyEntries.length > 0) {
      await LeadAssignmentHistory.insertMany(historyEntries);
      console.log(`📜 History logs created.`);
    }

    // Create summary notification for batch
    try {
      const summaryNotification = await Notification.create({
        recipient: assignToId,
        sender: updatedById,
        type: "LEAD_ASSIGNED", // Using same type but with batch context
        title: `Bulk Lead Assignment Complete`,
        message: `${assigner?.name || 'System'} assigned ${leadsToAssign.length} leads to you in batch ${batchId}.`,
        metadata: {
          batchId,
          leadCount: leadsToAssign.length,
          actionUrl: `/dashboard/leads?batch=${batchId}`,
          priority: "HIGH",
          isActionable: true,
          assignedBy: updatedById,
          assignedByName: assigner?.name || 'System',
          isBatch: true
        },
        channels: {
          inApp: true,
          email: true,
        },
        lifecycle: {
          status: "DELIVERED",
          deliveredAt: timestamp,
        },
        timeRules: {
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      });
      console.log(`📋 Created batch summary notification: ${summaryNotification._id}`);
    } catch (summaryError) {
      console.error("Failed to create summary notification:", summaryError);
    }

    return { success: true, count: leadsToAssign.length, batchId, assigneeName: assignee.name, assignerName: assigner?.name || 'System' };

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
