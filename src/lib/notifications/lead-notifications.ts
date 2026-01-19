import { safeNotify, buildMetadata } from "./utils";

/**
 * Notify when a lead is assigned to a user
 */
export const notifyLeadAssigned = async (
  leadId,
  assignedToId,
  assignedById,
  leadData
) => {
  await safeNotify({
    recipient: assignedToId,
    sender: assignedById,
    type: "LEAD_ASSIGNED",
    title: "New Lead Assigned",
    message: `You have been assigned a new lead: ${
      leadData.name || leadData.phone
    }`,
    metadata: buildMetadata({
      leadId,
      actionUrl: `/dashboard/leads?openDialog=true&leadId=${leadId}`,
      priority: leadData.priority || "MEDIUM",
      isActionable: true,
    }),
    channels: { inApp: true, email: true },
  });
};

/**
 * Notify when a lead status is updated
 */
export const notifyLeadStatusUpdate = async (
  leadId,
  userId,
  oldStatus,
  newStatus,
  leadData
) => {
  await safeNotify({
    recipient: userId,
    type: "LEAD_STATUS_UPDATE",
    title: "Lead Status Updated",
    message: `Lead status changed from "${oldStatus}" to "${newStatus}" for ${
      leadData?.name || leadData?.phone || "Unknown Lead"
    }`,
    metadata: buildMetadata({
      leadId,
      actionUrl: `/dashboard/leads/${leadId}`,
      priority: "MEDIUM",
      entityStatus: newStatus,
    }),
    channels: { inApp: true, email: false },
  });
};

/**
 * Notify when a lead follow-up is due
 */
export const notifyLeadFollowupDue = async (
  leadId,
  assignedToId,
  followupDate,
  leadData
) => {
  await safeNotify({
    recipient: assignedToId,
    type: "LEAD_FOLLOWUP_DUE",
    title: "Lead Follow-up Due",
    message: `Follow-up is due for lead: ${leadData.name || leadData.phone}`,
    metadata: buildMetadata({
      leadId,
      actionUrl: `/dashboard/leads/${leadId}`,
      priority: "HIGH",
      isActionable: true,
    }),
    channels: { inApp: true, email: true },
    scheduledFor: followupDate,
  });
};
