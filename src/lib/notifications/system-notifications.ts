import { getEmployeeIdsByRoles, sendBulkNotification } from "./utils";
import Employee from "../../models/Employee.js";

/**
 * Send system-wide announcement
 */
export const notifySystemAnnouncement = async (
  title,
  message,
  priority = "MEDIUM",
  targetRoles = []
) => {
  const recipients =
    targetRoles.length > 0
      ? await getEmployeeIdsByRoles(targetRoles)
      : (await Employee.find({}).select("_id")).map((u) => u._id.toString());

  await sendBulkNotification(recipients, {
    type: "SYSTEM_ANNOUNCEMENT",
    title,
    message,
    metadata: {
      priority: priority.toUpperCase(),
      actionUrl: `/dashboard`,
    },
    channels: {
      inApp: true,
      email: priority === "URGENT" || priority === "HIGH",
    },
  });
};

/**
 * Notify about property upload
 */
export const notifyPropertyUploaded = async (uploaderId, propertyData) => {
  const recipients = await getEmployeeIdsByRoles(
    ["Property Manager", "Admin"],
    uploaderId
  );
  if (recipients.length === 0) return;

  await sendBulkNotification(recipients, {
    sender: uploaderId,
    type: "PROPERTY_UPLOADED",
    title: "New Property Added",
    message: `A new property has been uploaded: ${
      propertyData.title || "Property"
    }`,
    metadata: {
      propertyId: propertyData._id,
      actionUrl: `/dashboard/properties/${propertyData._id}`,
      priority: "MEDIUM",
    },
    channels: { inApp: true, email: false },
  });
};
