import { safeNotify, buildMetadata } from "./utils";

const MOU_STATUS_CONFIG = {
  APPROVED: {
    title: "MOU Approved",
    message:
      "Your MOU has been approved. You can now proceed with your activities.",
    priority: "HIGH",
  },
  REJECTED: {
    title: "MOU Rejected",
    message:
      "Your MOU has been rejected. Please contact HR for more information.",
    priority: "MEDIUM",
  },
  PENDING: {
    title: "MOU Under Review",
    message: "Your MOU is currently under review by the management.",
    priority: "MEDIUM",
  },
};

/**
 * Notify when MOU status changes
 */
export const notifyMOUStatusChange = async (userId, status, approvedById) => {
  const config = MOU_STATUS_CONFIG[status];
  if (!config) return;

  await safeNotify({
    recipient: userId,
    sender: approvedById,
    type: `MOU_${status}`,
    title: config.title,
    message: config.message,
    metadata: buildMetadata({
      userId,
      actionUrl: `/dashboard/mou`,
      priority: config.priority,
      entityStatus: status,
    }),
    channels: { inApp: true, email: true },
  });
};
