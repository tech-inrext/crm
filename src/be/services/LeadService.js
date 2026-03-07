import { Service } from "@framework";
import Lead from "../models/Lead";
import FollowUp from "../models/FollowUp";
import { NotificationHelper } from "../../lib/notification-helpers";
import mongoose from "mongoose";

class LeadService extends Service {
  constructor() {
    super();
  }

  async createLead(req, res) {
    try {
      const { phone, ...rest } = req.body;

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

      let loggedInUserId = req.employee?._id || req.employee?.id;
      if (loggedInUserId && typeof loggedInUserId === "string") {
        try {
          loggedInUserId = new mongoose.Types.ObjectId(loggedInUserId);
        } catch (e) {
          // keep as is
        }
      }

      // Removed nextFollowUp / followUpNotes from newLead object
      // The rest of the fields (company, name, etc.) are still spread from ...rest
      const newLead = new Lead({
        uploadedBy: loggedInUserId,
        managerId: rest.managerId || loggedInUserId,
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
        } catch (notificationError) {
          console.error("Failed to send new lead notification:", notificationError);
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
  async assignLead(req, res) {
    const { leadId } = req.query;
    const { assignedTo } = req.body;
    const loggedInUserId = req.employee?._id;

    if (!leadId || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const previousAssignee = lead.assignedTo?.toString();

    lead.assignedTo = assignedTo;
    lead.updatedBy = loggedInUserId;
    await lead.save();

    // 🔔 Notify ONLY if assignee changed
    if (previousAssignee !== assignedTo) {
      try {
        await NotificationHelper.notifyLeadAssigned(
          lead._id,
          assignedTo,
          loggedInUserId,
          {
            leadId: lead.leadId,
            company: lead.company,
            name: lead.name,
            phone: lead.phone,
            priority: "HIGH",
          }
        );
      } catch (e) {
        console.error("Assign notification failed", e);
      }
    }

    return res.status(200).json({
      success: true,
      data: lead,
      message: "Lead assigned successfully",
    });
  }


  async getAllLeads(req, res) {
    try {
      const { page = 1, limit = 5, search = "", status, leadType, propertyName, budgetRange, assignedTo } = req.query;
      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (currentPage - 1) * itemsPerPage;

      const loggedInUserId = req.employee?._id;
      const baseQuery = {
        $or: [
          { uploadedBy: loggedInUserId },
          { managerId: loggedInUserId },
          { assignedTo: loggedInUserId },
        ],
      };

      const searchQuery = search
        ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
        : {};

      let statusQuery = {};
      if (status) {
        const statuses = Array.isArray(status)
          ? status
          : String(status).split(",").map((s) => s.trim()).filter(Boolean);

        if (statuses.length) {
          statusQuery = {
            status: { $in: statuses.map((s) => new RegExp(`^${s}$`, "i")) },
          };
        }
      }

      let leadTypeQuery = {};
      if (leadType) {
        const types = Array.isArray(leadType)
          ? leadType
          : String(leadType).split(",").map((s) => s.trim()).filter(Boolean);

        if (types.length) {
          leadTypeQuery = {
            leadType: { $in: types.map((t) => new RegExp(`^${t}$`, "i")) },
          };
        }
      }

      let propertyQuery = {};
      if (propertyName) {
        const properties = Array.isArray(propertyName)
          ? propertyName
          : String(propertyName).split(",").map((s) => s.trim()).filter(Boolean);

        if (properties.length) {
          propertyQuery = {
            propertyName: { $in: properties.map((p) => new RegExp(`^${p}$`, "i")) },
          };
        }
      }

      let budgetQuery = {};
      if (budgetRange) {
        const budgets = Array.isArray(budgetRange)
          ? budgetRange
          : String(budgetRange).split(",").map((s) => s.trim()).filter(Boolean);

        if (budgets.length) {
          budgetQuery = {
            budgetRange: { $in: budgets.map((b) => new RegExp(`^${b}$`, "i")) },
          };
        }
      }

      let assignedToQuery = {};
      if (assignedTo) {
        const userIds = Array.isArray(assignedTo)
          ? assignedTo
          : String(assignedTo).split(",").map((s) => s.trim()).filter(Boolean);

        if (userIds.length) {
          assignedToQuery = {
            assignedTo: { $in: userIds },
          };
        }
      }

      const queryParts = [baseQuery];
      if (Object.keys(searchQuery).length) queryParts.push(searchQuery);
      if (Object.keys(statusQuery).length) queryParts.push(statusQuery);
      if (Object.keys(leadTypeQuery).length) queryParts.push(leadTypeQuery);
      if (Object.keys(propertyQuery).length) queryParts.push(propertyQuery);
      if (Object.keys(budgetQuery).length) queryParts.push(budgetQuery);
      if (Object.keys(assignedToQuery).length) queryParts.push(assignedToQuery);

      const query = queryParts.length > 1 ? { $and: queryParts } : baseQuery;

      const [leads, totalLeads] = await Promise.all([
        Lead.find(query).populate("assignedTo", "fullName name email").populate("uploadedBy", "fullName name").populate("managerId", "fullName name").skip(skip).limit(itemsPerPage).sort({ createdAt: -1 }).lean(),
        Lead.countDocuments(query),
      ]);

      // Merge follow-up data for each lead (AGGREGATING NEW SCHEMA)
      const mergedLeads = await Promise.all(leads.map(async (lead) => {
        // 1. Get Count
        const count = await FollowUp.countDocuments({ leadId: lead._id });

        // 2. Get Latest
        const latest = await FollowUp.findOne({ leadId: lead._id }).sort({ createdAt: -1 }).lean();

        return {
          ...lead,
          followUpCount: count, // Used for Badge
          nextFollowUp: latest ? latest.followUpDate : null,
          // Providing empty arrays as notes are no longer on Lead object
          followUpNotes: latest ? [latest.note] : []
        };
      }));

      return res.status(200).json({
        success: true,
        data: mergedLeads,
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
    const loggedInUserId = req.employee?._id;

    try {
      // Support finding by _id or leadId (custom ID)
      let query = {};
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: id };
      } else {
        query = { leadId: id };
      }

      const lead = await Lead.findOne(query);

      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      const hasAccess =
        String(lead.uploadedBy) === String(loggedInUserId) ||
        String(lead.managerId) === String(loggedInUserId) ||
        String(lead.assignedTo) === String(loggedInUserId);

      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      const leadObj = lead.toObject();

      // Aggregating FollowUps
      const count = await FollowUp.countDocuments({ leadId: lead._id });
      const latest = await FollowUp.findOne({ leadId: lead._id }).sort({ createdAt: -1 }).lean();

      leadObj.followUpCount = count;
      leadObj.nextFollowUp = latest ? latest.followUpDate : null;

      return res.status(200).json({ success: true, data: leadObj });
    } catch (error) {
      console.error("Error fetching lead:", error);
      return res.status(500).json({ success: false, error: "Error: " + error.message });
    }
  }

  async updateLeadDetails(req, res) {
    const { id } = req.query;
    const { phone, leadType, ...otherUpdateFields } = req.body;
    const updateFields = { ...otherUpdateFields };
    const loggedInUserId = req.employee?._id;

    try {
      // Support finding by _id or leadId (custom ID)
      let query = {};
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: id };
      } else {
        query = { leadId: id };
      }

      const originalLead = await Lead.findOne(query);
      if (!originalLead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      // Explicitly handle leadType
      if (leadType) {
        const validLeadTypes = ["hot lead", "warm lead", "cold lead"];
        if (validLeadTypes.includes(leadType)) {
          updateFields.leadType = leadType;
        } else {
          // Optional: throw error or ignore. Let's ignore invalid values but log it
          console.warn(`Invalid leadType received: ${leadType}`);
        }
      }

      if (updateFields.assignedTo === "") {
        updateFields.assignedTo = null;
      }

      // Use _id from the found lead to ensure update works
      const updatedLead = await Lead.findByIdAndUpdate(
        originalLead._id,
        { $set: { ...updateFields, updatedBy: loggedInUserId } },
        { new: true }
      );

      if (!updatedLead) {
        return res.status(404).json({ success: false, error: "Lead not found during update" });
      }

      // Notifications (Status & Assign) logic kept the same...
      if (updateFields.status && originalLead.status !== updateFields.status) {
        try {
          await NotificationHelper.notifyLeadStatusUpdate(
            updatedLead._id,
            updatedLead.assignedTo || req.employee._id,
            originalLead.status,
            updateFields.status,
            { leadId: updatedLead.leadId, company: updatedLead.company, name: updatedLead.name, phone: updatedLead.phone }
          );
        } catch (e) { }
      }
      if (updateFields.assignedTo && originalLead.assignedTo?.toString() !== updateFields.assignedTo) {
        try {
          await NotificationHelper.notifyLeadAssigned(
            updatedLead._id,
            updateFields.assignedTo,
            req.employee._id,
            { leadId: updatedLead.leadId, company: updatedLead.company, name: updatedLead.name, phone: updatedLead.phone, priority: "HIGH" }
          );
        } catch (e) { }
      }

      return res.status(200).json({ success: true, data: updatedLead });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default LeadService;
