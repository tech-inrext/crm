// Example integration with Lead module
import { NotificationHelper } from "../../../../lib/notification-helpers";

// Add this to your existing LeadService.js methods

class LeadServiceWithNotifications extends LeadService {
  async assignLead(req, res) {
    try {
      const { leadId, assignedTo } = req.body;
      const assignedBy = req.employee?._id;

      // Update the lead
      const lead = await Lead.findByIdAndUpdate(
        leadId,
        { assignedTo, assignedBy, assignedAt: new Date() },
        { new: true }
      );

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      // Send notification to the assigned user
      await NotificationHelper.notifyLeadAssigned(
        leadId,
        assignedTo,
        assignedBy,
        {
          name: lead.fullName,
          phone: lead.phone,
          priority: lead.priority || "MEDIUM",
        }
      );

      return res.status(200).json({
        success: true,
        data: lead,
        message: "Lead assigned successfully",
      });
    } catch (error) {
      console.error("Error assigning lead:", error);
      return res.status(500).json({
        success: false,
        message: "Error assigning lead",
        error: error.message,
      });
    }
  }

  async updateLeadStatus(req, res) {
    try {
      const { leadId } = req.params;
      const { status, notes } = req.body;

      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      const oldStatus = lead.status;

      // Update lead
      lead.status = status;
      if (notes) lead.notes = notes;
      lead.updatedAt = new Date();

      await lead.save();

      // Send notification if lead is assigned and status changed
      if (lead.assignedTo && oldStatus !== status) {
        await NotificationHelper.notifyLeadStatusUpdate(
          leadId,
          lead.assignedTo,
          oldStatus,
          status,
          {
            name: lead.fullName,
            phone: lead.phone,
          }
        );
      }

      return res.status(200).json({
        success: true,
        data: lead,
        message: "Lead status updated successfully",
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating lead status",
        error: error.message,
      });
    }
  }

  async scheduleFollowup(req, res) {
    try {
      const { leadId, followupDate, notes } = req.body;

      const lead = await Lead.findByIdAndUpdate(
        leadId,
        {
          nextFollowup: followupDate,
          followupNotes: notes,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      // Schedule followup notification
      if (lead.assignedTo) {
        await NotificationHelper.notifyLeadFollowupDue(
          leadId,
          lead.assignedTo,
          new Date(followupDate),
          {
            name: lead.fullName,
            phone: lead.phone,
          }
        );
      }

      return res.status(200).json({
        success: true,
        data: lead,
        message: "Follow-up scheduled successfully",
      });
    } catch (error) {
      console.error("Error scheduling followup:", error);
      return res.status(500).json({
        success: false,
        message: "Error scheduling follow-up",
        error: error.message,
      });
    }
  }
}
