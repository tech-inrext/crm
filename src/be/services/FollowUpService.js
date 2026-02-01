
import { Service } from "@framework";
import FollowUp from "../models/FollowUp";
import Lead from "../models/Lead";
import dbConnect from "../../lib/mongodb";
import mongoose from "mongoose";

class FollowUpService extends Service {
  // Helper to find lead ID
  async findLeadByIdentifier(identifier) {
    if (!identifier) return null;
    const identifierStr = String(identifier);
    
    // Check if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(identifierStr)) {
        // Double check if it exists
        const byId = await Lead.findById(identifierStr);
        if (byId) return byId;
    }

    // Check by custom leadId
    const byCustomId = await Lead.findOne({ leadId: identifierStr });
    if (byCustomId) return byCustomId;

    return null;
  }

  async handleFollowUpRequest(req, res) {
    try {
      await dbConnect();
      const { leadId, leadIdentifier, followUpDate, note, followUpType } = req.body || {};
      
      console.log(`[FollowUpService] Processing request:`, { leadId, leadIdentifier, type: followUpType });

      // 1. Resolve Lead
      let targetLead = null;
      if (leadId) {
          targetLead = await this.findLeadByIdentifier(leadId);
      }
      if (!targetLead && leadIdentifier) {
          targetLead = await this.findLeadByIdentifier(leadIdentifier);
      }

      if (!targetLead) {
        return res.status(404).json({ success: false, message: "Lead not found" });
      }

      // 2. Resolve User
      const currentUser = req.employee || req.user;
      const submittedBy = currentUser ? (currentUser._id || currentUser.id) : null;

      // 3. Create Document
      // Note: We no longer Append. We ALWAYS create a new document.
      const validTypes = ["site visit", "call back", "note"];
      const safeType = validTypes.includes(followUpType) ? followUpType : "note";
      
      const newFollowUp = new FollowUp({
        leadId: targetLead._id,
        followUpDate: followUpDate || new Date(), // Default to now if not provided
        note: note || "N/A",
        submittedBy: submittedBy ? new mongoose.Types.ObjectId(submittedBy) : null,
        followUpType: safeType
      });

      await newFollowUp.save();

      return res.status(201).json({ success: true, data: newFollowUp, message: "Follow-up added successfully" });

    } catch (error) {
      console.error("[FollowUpService] Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFollowUpHistory(req, res) {
    try {
      await dbConnect();
      const { leadId, leadIdentifier } = req.query;

      // 1. Resolve Lead
      let targetLead = null;
      if (leadId) {
          targetLead = await this.findLeadByIdentifier(leadId);
      }
      if (!targetLead && leadIdentifier) {
          targetLead = await this.findLeadByIdentifier(leadIdentifier);
      }

      if (!targetLead) {
         // Return empty if lead not found (soft fail for frontend search)
         return res.status(200).json({ success: true, data: [] });
      }

      // 2. Fetch History
      // Find ALL documents matching this leadId
      const history = await FollowUp.find({ leadId: targetLead._id })
        .sort({ createdAt: 1 }) // Oldest first (latest at bottom)
        .populate("submittedBy", "name email") // Get basic user details
        .lean();

      // 3. Format for Frontend
      const formattedHistory = history.map(doc => ({
        _id: doc._id,
        followUpDate: doc.followUpDate,
        note: doc.note,
        followUpType: doc.followUpType,
        cabBookingId: doc.cabBookingId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        submittedByName: doc.submittedBy?.name || "System/Unknown"
      }));

      return res.status(200).json({ 
          success: true, 
          data: formattedHistory,
          lead: {
              fullName: targetLead.fullName,
              phone: targetLead.phone,
              id: targetLead._id
          }
      });

    } catch (error) {
      console.error("[FollowUpService] Get History Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default FollowUpService;
