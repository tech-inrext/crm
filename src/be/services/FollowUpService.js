import { Service } from "@framework";
import FollowUp from "../../models/FollowUp";
import Lead from "../../models/Lead";
import Employee from "../../models/Employee";
import dbConnect from "../../lib/mongodb";
import mongoose from "mongoose";
import notificationService from "../../services/notification.service";

class FollowUpService extends Service {
  constructor() {
    super();
  }

  // Helper: Send notification for lead note
  async _sendFollowUpNotification(leadId, note, currentUserId) {
    try {
      if (!leadId) return;

      const lead = await Lead.findById(leadId).select("assignedTo fullName phone");

      if (!lead || !lead.assignedTo) {
        console.log(`[FollowUpService] Notification skipped: Lead ${leadId} has no assigned user`);
        return;
      }

      // Don't notify if the user is acting on their own lead
      if (currentUserId && lead.assignedTo.toString() === currentUserId.toString()) {
        console.log(`[FollowUpService] Notification skipped: User ${currentUserId} is the lead owner`);
        return;
      }

      const sender = await Employee.findById(currentUserId).select("name");
      const senderName = sender ? sender.name : "A user";
      const leadName = lead.fullName || lead.phone || "a lead";

      await notificationService.createNotification({
        recipient: lead.assignedTo,
        sender: currentUserId,
        type: "LEAD_NOTE_ADDED",
        title: "New Note on Lead",
        message: `${senderName} added a note to lead ${leadName}: "${note.substring(0, 50)}${note.length > 50 ? '...' : ''}"`,
        metadata: {
          leadId: lead._id,
          actionUrl: `/dashboard/leads/${lead._id}`,
          priority: "MEDIUM",
          isActionable: true
        },
        channels: {
          inApp: true,
          email: true,
          push: false
        }
      });
      console.log(`[FollowUpService] Notification sent to ${lead.assignedTo} for lead ${leadId}`);
    } catch (error) {
      console.error("[FollowUpService] Error sending notification:", error);
    }
  }

  // Helper: try to find a lead by various normalized forms of an identifier
  async findLeadByIdentifier(identifier) {
    if (!identifier) return null;
    const identifierStr = String(identifier);
    const invisibleRegex = /[\u200B\uFEFF\u201A\u2018\u2019\u201C\u201D]/g;
    const normalized = identifierStr.replace(invisibleRegex, "").trim();

    // Try exact matches (raw and normalized) and _id
    try {
      const orConditions = [
        { leadId: identifierStr },
        { leadId: normalized },
      ];

      if (identifierStr.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ _id: identifierStr });
      }
      if (normalized.match(/^[0-9a-fA-F]{24}$/) && normalized !== identifierStr) {
        orConditions.push({ _id: normalized });
      }

      const byExact = await Lead.findOne({ $or: orConditions });
      if (byExact) return byExact;
    } catch (e) {
      // ignore
    }

    return null;
  }

  /**
   * Create a follow-up record for a lead.
   * This should only be called once per lead.
   */
  async createFollowUp(req, res) {
    try {
      const { leadId, leadIdentifier, followUpDate, note } = req.body || {};
      console.log(`[FollowUpService] createFollowUp body:`, { leadId, leadIdentifier, note });

      let targetLeadId = leadId;

      if (!targetLeadId && leadIdentifier) {
        const lead = await this.findLeadByIdentifier(leadIdentifier);
        if (lead) targetLeadId = lead._id;
      }

      if (!targetLeadId) {
        return res.status(400).json({ success: false, message: "leadId or leadIdentifier is required" });
      }

      // Check if follow-up already exists for this lead
      const existingFollowUp = await FollowUp.findOne({ leadId: targetLeadId });
      if (existingFollowUp) {
        return res.status(400).json({
          success: false,
          message: "Follow-up record already exists for this lead."
        });
      }

      // If note or date is provided, add as first entry, else add an empty entry or empty array
      let currentUserId = req.employee?._id || req.employee?.id;
      if (currentUserId && typeof currentUserId === "string") {
        try {
          currentUserId = new mongoose.Types.ObjectId(currentUserId);
        } catch (e) { }
      }
      console.log(`[FollowUpService] createFollowUp effective user ID: ${currentUserId || "UNKNOWN"}`);

      const { followUpType } = req.body;
      const validTypes = ["site visit", "call back", "note"];
      const safeType = validTypes.includes(followUpType) ? followUpType : "note";

      // Store date only if type is 'call back' (or 'site visit' if consistent with logic, but user specifically asked for 'call back' condition for date visibility)
      // The user requirement said: "Store followUpDate only when followUpType === 'call back'"
      const finalDate = safeType === "call back" ? followUpDate : null;

      const initialNotes = (followUpDate || note || safeType) ? [{
        followUpDate: finalDate || null,
        note: note || "N/A",
        submittedBy: currentUserId || null,
        followUpType: safeType
      }] : [];

      const newFollowUp = new FollowUp({
        leadId: targetLeadId,
        followUps: initialNotes,
      });

      await newFollowUp.save();

      // Send notification
      await this._sendFollowUpNotification(targetLeadId, note || "Follow-up created", currentUserId);

      return res.status(201).json({ success: true, data: newFollowUp });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Add a new note and date to an existing follow-up record.
   */
  async addNote(req, res) {
    try {
      const { leadId, leadIdentifier, followUpDate, note } = req.body || {};
      console.log(`[FollowUpService] addNote body:`, { leadId, leadIdentifier, note });

      let targetLeadId = leadId;

      if (!targetLeadId && leadIdentifier) {
        const lead = await this.findLeadByIdentifier(leadIdentifier);
        if (lead) targetLeadId = lead._id;
      }

      if (!targetLeadId) {
        return res.status(400).json({
          success: false,
          message: "Lead identification is required"
        });
      }

      const followUp = await FollowUp.findOne({ leadId: targetLeadId });
      let currentUserId = req.employee?._id || req.employee?.id;
      if (currentUserId && typeof currentUserId === "string") {
        try {
          currentUserId = new mongoose.Types.ObjectId(currentUserId);
        } catch (e) { }
      }

      if (!followUp) {
        console.log(`[FollowUpService] Creating new FollowUp document for lead: ${targetLeadId}. User: ${currentUserId || "UNKNOWN"}`);

        const { followUpType } = req.body;
        const validTypes = ["site visit", "call back", "note"];
        const safeType = validTypes.includes(followUpType) ? followUpType : "note";
        const finalDate = safeType === "call back" ? followUpDate : null;

        const newFollowUp = new FollowUp({
          leadId: targetLeadId,
          followUps: [{
            followUpDate: finalDate || null,
            note: note || "N/A",
            submittedBy: currentUserId || null,
            followUpType: safeType
          }],
        });
        await newFollowUp.save();
        return res.status(201).json({ success: true, data: newFollowUp });
      }

      console.log(`[FollowUpService] Appending note to existing FollowUp for lead: ${targetLeadId}`);
      console.log(`[FollowUpService] Saving with submittedBy user ID: ${currentUserId || "MISSING"}`);

      const { followUpType } = req.body;
      const validTypes = ["site visit", "call back", "note"];
      const safeType = validTypes.includes(followUpType) ? followUpType : "note";
      const finalDate = safeType === "call back" ? followUpDate : null;

      followUp.followUps.push({
        followUpDate: finalDate || null,
        note: note || "N/A",
        submittedBy: currentUserId || null,
        followUpType: safeType
      });
      await followUp.save();

      // Send notification
      await this._sendFollowUpNotification(targetLeadId, note || "Note added", currentUserId);

      return res.status(200).json({ success: true, data: followUp });
    } catch (error) {
      console.error("[FollowUpService] addNote Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get follow-up details for a lead.
   */
  async getFollowUpByLeadId(req, res) {
    try {
      const { leadId, leadIdentifier } = req.query;

      let targetLeadId = leadId;

      if (!targetLeadId && leadIdentifier) {
        const lead = await this.findLeadByIdentifier(leadIdentifier);
        if (lead) targetLeadId = lead._id;
      }

      if (!targetLeadId) {
        return res.status(400).json({ success: false, message: "leadId or leadIdentifier is required" });
      }

      const followUp = await FollowUp.findOne({ leadId: targetLeadId })
        .populate("leadId")
        .populate({
          path: "followUps.submittedBy",
          model: "Employee",
          select: "name",
          options: { strictPopulate: false }
        });

      if (!followUp) {
        return res.status(200).json({ success: true, data: [] });
      }

      // Map for frontend
      const items = followUp.followUps.map(f => {
        const item = f.toObject();
        let submittedByName = "Unknown";

        if (f.submittedBy) {
          if (f.submittedBy.name) {
            submittedByName = f.submittedBy.name;
          } else if (typeof f.submittedBy === 'string' || (f.submittedBy instanceof mongoose.Types.ObjectId)) {
            submittedByName = `User ID: ${f.submittedBy.toString().slice(-4)}`;
          }
        }

        return {
          ...item,
          submittedByName
        };
      });

      return res.status(200).json({
        success: true,
        data: items,
        lead: followUp.leadId ? {
          phone: followUp.leadId.phone,
          fullName: followUp.leadId.fullName
        } : null
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async post(req, res) {
    try {
      await dbConnect();
      const { action } = req.query || {};
      console.log(`[FollowUpService] POST request received. Action: ${action || "addNote"}`);

      if (action === "create") {
        return await this.createFollowUp(req, res);
      } else {
        return await this.addNote(req, res);
      }
    } catch (error) {
      console.error("[FollowUpService] POST fatal error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
    }
  }

  async get(req, res) {
    try {
      await dbConnect();
      console.log("[FollowUpService] GET request received");
      return await this.getFollowUpByLeadId(req, res);
    } catch (error) {
      console.error("[FollowUpService] GET fatal error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
    }
  }
}

export default FollowUpService;
