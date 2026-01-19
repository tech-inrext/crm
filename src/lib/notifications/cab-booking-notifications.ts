import {
  safeNotify,
  notifyRecipients,
  filterRecipients,
  buildMetadata,
} from "./utils";

const CAB_STATUS_CONFIG = {
  approved: { msg: "Your cab booking has been approved!", priority: "HIGH" },
  rejected: { msg: "Your cab booking has been rejected.", priority: "HIGH" },
  active: { msg: "Your cab is on the way!", priority: "URGENT" },
  completed: {
    msg: "Your cab booking has been completed.",
    priority: "MEDIUM",
  },
  cancelled: { msg: "Your cab booking has been cancelled.", priority: "HIGH" },
};

/**
 * Notify manager about a new cab booking request
 */
export const notifyCabBookingRequest = async (
  bookingId,
  bookingData,
  requesterId,
  managerId
) => {
  if (!managerId) return;

  await safeNotify({
    recipient: managerId,
    sender: requesterId,
    type: "CAB_BOOKING_REQUESTED",
    title: "New Cab Booking Request",
    message: `${
      bookingData.employeeName || "A team member"
    } has requested a cab booking for ${bookingData.clientName} from ${
      bookingData.pickupPoint
    } to ${bookingData.dropPoint}.`,
    metadata: buildMetadata({
      bookingId,
      ...bookingData,
      actionUrl: `/dashboard/cab-booking?bookingId=${bookingId}`,
      priority: "HIGH",
    }),
    channels: { inApp: true, email: true },
  });
};

/**
 * Notify when cab booking status changes
 */
export const notifyCabBookingStatusChange = async (
  bookingId,
  bookingData,
  prevStatus,
  newStatus,
  updatedById
) => {
  const recipients = filterRecipients(
    bookingData.cabBookedBy,
    bookingData.managerId !== updatedById && bookingData.managerId
  );
  const statusConfig = CAB_STATUS_CONFIG[newStatus] || {
    msg: `Your cab booking status changed to ${newStatus}.`,
    priority: "MEDIUM",
  };

  await notifyRecipients(
    recipients,
    {
      type: `CAB_BOOKING_${newStatus.toUpperCase()}`,
      title: "Cab Booking Update",
      message: statusConfig.msg,
      metadata: buildMetadata({
        bookingId,
        previousStatus: prevStatus,
        newStatus,
        clientName: bookingData.clientName,
        pickupPoint: bookingData.pickupPoint,
        dropPoint: bookingData.dropPoint,
        actionUrl: `/dashboard/cab-booking?bookingId=${bookingId}`,
        priority: statusConfig.priority,
      }),
      channels: {
        inApp: true,
        email: ["approved", "rejected", "cancelled"].includes(newStatus),
      },
    },
    updatedById
  );
};

/**
 * Notify when a vendor is assigned to a cab booking
 */
export const notifyCabBookingVendorAssignment = async (
  bookingId,
  bookingData,
  vendorId,
  assignedById
) => {
  const recipients = filterRecipients(
    vendorId,
    bookingData.cabBookedBy !== assignedById && bookingData.cabBookedBy
  );

  for (const recipientId of recipients) {
    const isVendor = recipientId === vendorId;
    await safeNotify({
      recipient: recipientId,
      sender: assignedById,
      type: "CAB_BOOKING_VENDOR_ASSIGNED",
      title: isVendor
        ? "New Cab Booking Assignment"
        : "Vendor Assigned to Your Booking",
      message: isVendor
        ? `You have been assigned a cab booking for ${bookingData.clientName} from ${bookingData.pickupPoint} to ${bookingData.dropPoint}.`
        : `A vendor has been assigned to your cab booking for ${bookingData.clientName}.`,
      metadata: buildMetadata({
        bookingId,
        vendorId,
        ...bookingData,
        actionUrl: `/dashboard/cab-booking?bookingId=${bookingId}`,
        priority: "HIGH",
      }),
      channels: { inApp: true, email: true },
    });
  }
};

/**
 * Notify about vendor assignment (legacy support)
 */
export const notifyVendorAssigned = async (
  bookingId,
  employeeId,
  vendorId,
  bookingData
) => {
  await safeNotify({
    recipient: employeeId,
    type: "CAB_BOOKING_ASSIGNED",
    title: "Cab Vendor Assigned",
    message: `A vendor has been assigned for your cab booking on ${bookingData.date}`,
    metadata: buildMetadata({
      cabBookingId: bookingId,
      actionUrl: `/dashboard/cab-booking/${bookingId}`,
      priority: "MEDIUM",
    }),
    channels: { inApp: true, email: true },
  });

  await safeNotify({
    recipient: vendorId,
    type: "VENDOR_ASSIGNED",
    title: "New Booking Assignment",
    message: `You have been assigned a new cab booking for ${bookingData.date}`,
    metadata: buildMetadata({
      cabBookingId: bookingId,
      vendorBookingId: bookingId,
      actionUrl: `/dashboard/vendor-booking/${bookingId}`,
      priority: "HIGH",
      isActionable: true,
    }),
    channels: { inApp: true, email: true },
  });
};
