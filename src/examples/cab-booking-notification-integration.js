// Example integration with Cab Booking module
import { NotificationHelper } from "../../../../lib/notification-helpers";

// Add this to your existing CabBooking service/controller

class CabBookingWithNotifications {
  async createBooking(req, res) {
    try {
      const bookingData = req.body;
      const employeeId = req.employee?._id;

      // Create the booking (your existing logic)
      const booking = new CabBooking({
        ...bookingData,
        employeeId,
        status: "PENDING",
      });

      await booking.save();

      // Get employee's manager for approval notification
      const employee = await Employee.findById(employeeId).select("managerId");

      if (employee?.managerId) {
        await NotificationHelper.notifyCabBookingRequest(
          booking._id,
          employeeId,
          employee.managerId,
          {
            date: booking.bookingDate,
            priority: booking.priority || "MEDIUM",
          }
        );
      }

      return res.status(201).json({
        success: true,
        data: booking,
        message: "Cab booking request submitted successfully",
      });
    } catch (error) {
      console.error("Error creating cab booking:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating booking",
        error: error.message,
      });
    }
  }

  async approveBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const approverId = req.employee?._id;

      const booking = await CabBooking.findByIdAndUpdate(
        bookingId,
        {
          status: "APPROVED",
          approvedBy: approverId,
          approvedAt: new Date(),
        },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Notify the employee about approval
      await NotificationHelper.notifyCabBookingApproved(
        bookingId,
        booking.employeeId,
        approverId,
        {
          date: booking.bookingDate,
        }
      );

      return res.status(200).json({
        success: true,
        data: booking,
        message: "Booking approved successfully",
      });
    } catch (error) {
      console.error("Error approving booking:", error);
      return res.status(500).json({
        success: false,
        message: "Error approving booking",
        error: error.message,
      });
    }
  }

  async rejectBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;
      const rejectorId = req.employee?._id;

      const booking = await CabBooking.findByIdAndUpdate(
        bookingId,
        {
          status: "REJECTED",
          rejectedBy: rejectorId,
          rejectedAt: new Date(),
          rejectionReason: reason,
        },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Notify the employee about rejection
      await NotificationHelper.notifyCabBookingRejected(
        bookingId,
        booking.employeeId,
        rejectorId,
        reason,
        {
          date: booking.bookingDate,
        }
      );

      return res.status(200).json({
        success: true,
        data: booking,
        message: "Booking rejected",
      });
    } catch (error) {
      console.error("Error rejecting booking:", error);
      return res.status(500).json({
        success: false,
        message: "Error rejecting booking",
        error: error.message,
      });
    }
  }

  async assignVendor(req, res) {
    try {
      const { bookingId } = req.params;
      const { vendorId } = req.body;

      const booking = await CabBooking.findByIdAndUpdate(
        bookingId,
        {
          assignedVendor: vendorId,
          vendorAssignedAt: new Date(),
        },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Notify both employee and vendor
      await NotificationHelper.notifyVendorAssigned(
        bookingId,
        booking.employeeId,
        vendorId,
        {
          date: booking.bookingDate,
        }
      );

      return res.status(200).json({
        success: true,
        data: booking,
        message: "Vendor assigned successfully",
      });
    } catch (error) {
      console.error("Error assigning vendor:", error);
      return res.status(500).json({
        success: false,
        message: "Error assigning vendor",
        error: error.message,
      });
    }
  }
}
