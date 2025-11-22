import { Service } from "@framework";
import Lead from "../../models/Lead";
import { NotificationHelper } from "../../lib/notification-helpers";

class LeadService extends Service {
  constructor() {
    super();
  }

  async createLead(req, res) {
    try {
      const { phone, ...rest } = req.body;

      // validator(req.body, "createLead");

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required",
        });
      }

      const existingLead = await Lead.findOne({ phone });

      if (existingLead) {
        return res.status(409).json({
          success: false,
          message: "Lead already exists with this phone number.",
        });
      }

      const leadId = `LD-${Date.now().toString().slice(-6)}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      const loggedInUserId = req.employee?._id;
      console.log(loggedInUserId);

      const newLead = new Lead({
        uploadedBy: loggedInUserId,
        leadId,
        phone,
        ...rest,
      });

      await newLead.save();

      // Send notification if lead is assigned to someone during creation
      if (rest.assignedTo) {
        try {
          await NotificationHelper.notifyLeadAssigned(
            newLead._id,
            rest.assignedTo,
            loggedInUserId,
            {
              leadId: newLead.leadId,
              company: newLead.company || "Unknown Company",
              name: newLead.name,
              phone: newLead.phone,
              priority: "HIGH",
            }
          );
          console.log(
            `✅ Notification sent for new lead assignment to: ${rest.assignedTo}`
          );
        } catch (notificationError) {
          console.error(
            "Failed to send new lead notification:",
            notificationError
          );
          // Don't fail the creation if notification fails
        }
      }

      return res.status(201).json({ success: true, data: newLead });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error creating lead",
        error: error.message,
      });
    }
  }

  async getAllLeads(req, res) {
    try {
      const { page = 1, limit = 5, search = "", status } = req.query;
      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (currentPage - 1) * itemsPerPage;

      const loggedInUserId = req.employee?._id;
      const baseQuery = { uploadedBy: loggedInUserId };

      // Optional search filter
      const searchQuery = search
        ? {
            $or: [
              { fullName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // Optional status filter
      // Accepts: status=New or status=New,Closed or status[]=New&status[]=Closed
      let statusQuery = {};
      if (status) {
        // status may be a string (possibly comma-separated) or array
        const statuses = Array.isArray(status)
          ? status
          : String(status)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

        if (statuses.length) {
          // Build case-insensitive match for each status to be safe
          statusQuery = {
            status: { $in: statuses.map((s) => new RegExp(`^${s}$`, "i")) },
          };
        }
      }

      const queryParts = [baseQuery];
      if (Object.keys(searchQuery).length) queryParts.push(searchQuery);
      if (Object.keys(statusQuery).length) queryParts.push(statusQuery);

      const query = queryParts.length > 1 ? { $and: queryParts } : baseQuery;

      const [leads, totalLeads] = await Promise.all([
        Lead.find(query).skip(skip).limit(itemsPerPage).sort({ createdAt: -1 }),
        Lead.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: leads,
        pagination: {
          totalItems: totalLeads,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalLeads / itemsPerPage),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leads",
        error: error.message,
      });
    }
  }

  async getLeadById(req, res) {
    const { id } = req.query;

    try {
      const lead = await Lead.findById(id); // Fetch lead
      if (!lead) {
        return res
          .status(404)
          .json({ success: false, error: "Lead not found" });
      }

      return res.status(200).json({ success: true, data: lead });
    } catch (error) {
      console.error("Error fetching lead:", error);
      return res
        .status(500)
        .json({ success: false, error: "Error: " + error.message });
    }
  }

  async updateLeadDetails(req, res) {
    const { id } = req.query;
    const { phone, ...updateFields } = req.body;

    try {
      // Get the original lead before updating to compare changes
      const originalLead = await Lead.findById(id);
      if (!originalLead) {
        return res
          .status(404)
          .json({ success: false, error: "Lead not found" });
      }

      const updatedLead = await Lead.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      );

      if (!updatedLead) {
        return res
          .status(404)
          .json({ success: false, error: "Lead not found" });
      }

      // Check if status changed and send notification
      if (updateFields.status && originalLead.status !== updateFields.status) {
        try {
          await NotificationHelper.notifyLeadStatusUpdate(
            updatedLead._id,
            updatedLead.assignedTo || req.employee._id,
            originalLead.status,
            updateFields.status,
            {
              leadId: updatedLead.leadId,
              company: updatedLead.company || "Unknown Company",
              name: updatedLead.name,
              phone: updatedLead.phone,
            }
          );
          console.log(
            `✅ Notification sent for lead status change: ${originalLead.status} → ${updateFields.status}`
          );
        } catch (notificationError) {
          console.error(
            "Failed to send lead status notification:",
            notificationError
          );
          // Don't fail the update if notification fails
        }
      }

      // Check if lead was assigned to someone and send notification
      if (
        updateFields.assignedTo &&
        originalLead.assignedTo?.toString() !== updateFields.assignedTo
      ) {
        try {
          await NotificationHelper.notifyLeadAssigned(
            updatedLead._id,
            updateFields.assignedTo,
            req.employee._id,
            {
              leadId: updatedLead.leadId,
              company: updatedLead.company || "Unknown Company",
              name: updatedLead.name,
              phone: updatedLead.phone,
              priority: "HIGH",
            }
          );
          console.log(
            `✅ Notification sent for lead assignment to user: ${updateFields.assignedTo}`
          );
        } catch (notificationError) {
          console.error(
            "Failed to send lead assignment notification:",
            notificationError
          );
          // Don't fail the update if notification fails
        }
      }

      return res.status(200).json({ success: true, data: updatedLead });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default LeadService;
