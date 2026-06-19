
import { Service } from "@framework";
import FollowUp from "../models/FollowUp";
import Lead from "../models/Lead";
import LeadActivity from "../models/LeadActivity";
import LeadService from "./LeadService";
import dbConnect from "../../lib/mongodb";
import mongoose from "mongoose";
import { sendSiteVisitFeedbackWhatsappMessage } from "../whatsapp-msg-service/lead-notifications/siteVisitFeedback.js";
import { sendSiteVisitFeedbackEmail } from "../email-service/follow-up-email/sendSiteVisitFeedbackMail.js";

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
        targetLead = await Lead.findById(leadId).populate("uploadedBy", "name email").populate("assignedTo", "name email");
        if (!targetLead) targetLead = await Lead.findOne({ leadId }).populate("uploadedBy", "name email").populate("assignedTo", "name email");
      }
      if (!targetLead && leadIdentifier) {
        targetLead = await this.findLeadByIdentifier(leadIdentifier);
        if (targetLead) {
          await targetLead.populate("uploadedBy", "name email");
          await targetLead.populate("assignedTo", "name email");
        }
      }

      if (!targetLead) {
        // Return empty if lead not found (soft fail for frontend search)
        return res.status(200).json({ success: true, data: [] });
      }

      // 🛡️ Resolve Access Permissions early for masking
      const loggedInUserId = req.employee?._id;
      const isUploader = String(targetLead.uploadedBy?._id || targetLead.uploadedBy) === String(loggedInUserId);
      const isAssignee = String(targetLead.assignedTo?._id || targetLead.assignedTo) === String(loggedInUserId);
      const isSystemAdmin = req.isSystemAdmin;

      // 2. Fetch History
      // Find ALL documents matching this leadId
      const history = await FollowUp.find({ leadId: targetLead._id })
        .populate("submittedBy", "name email") // Get basic user details
        .lean();

      const activities = await LeadActivity.find({ leadId: targetLead._id })
        .populate("updatedBy", "name email")
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
        submittedByName: doc.submittedBy?.name || "System/Unknown",
        outcome: doc.outcome || "pending",
        feedbackRemarks: doc.feedbackRemarks || "",
        interestLevel: doc.interestLevel || "",
        missedReason: doc.missedReason || "",
        missedReasonDetails: doc.missedReasonDetails || "",
        feedbackFormUrl: doc.feedbackFormUrl || null,
        feedbackToken: doc.feedbackToken || null,
      }));

      const formattedActivities = activities.map(doc => {
        let change = doc.change;
        // 🛡️ Mask phone in logs if unauthorized
        if (change && !isUploader && !isAssignee && !isSystemAdmin) {
          change = { ...change };
          // Mask phone if changed
          if (change.phone) {
            if (change.phone.prev) change.phone.prev = LeadService.maskPhone(change.phone.prev);
            if (change.phone.new) change.phone.new = LeadService.maskPhone(change.phone.new);
          }
          // Mask email if changed
          if (change.email) {
            if (change.email.prev) change.email.prev = LeadService.maskEmail(change.email.prev);
            if (change.email.new) change.email.new = LeadService.maskEmail(change.email.new);
          }
        }

        return {
          _id: doc._id,
          followUpType: "history",
          change: change,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          submittedByName: doc.updatedBy?.name || "System/Unknown",
        };
      });

      const creationEntry = {
        _id: targetLead._id + "_creation",
        followUpType: "history",
        note: "Lead Created by ",
        createdAt: targetLead.createdAt,
        updatedAt: targetLead.createdAt,
        submittedByName: targetLead.uploadedBy?.name || "System/Unknown",
        isCreation: true,
      };

      const combinedArr = [creationEntry, ...formattedHistory, ...formattedActivities];
      combinedArr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));



      let displayPhone = targetLead.phone;
      let displayEmail = targetLead.email;
      if (!isUploader && !isAssignee && !isSystemAdmin) {
        displayPhone = LeadService.maskPhone(targetLead.phone);
        displayEmail = LeadService.maskEmail(targetLead.email);
      }

      return res.status(200).json({
        success: true,
        data: combinedArr,
        lead: {
          fullName: targetLead.fullName,
          phone: displayPhone,
          email: displayEmail,
          id: targetLead._id,
          assignedTo: targetLead.assignedTo,
          managerId: targetLead.managerId,
          budgetRange: targetLead.budgetRange
        }
      });

    } catch (error) {
      console.error("[FollowUpService] Get History Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateFollowUpOutcome(req, res) {
    try {
      await dbConnect();
      const { 
        followUpId, 
        outcome,
        feedbackRemarks,
        interestLevel,
        missedReason,
        missedReasonDetails
      } = req.body || {};

      if (!followUpId || !outcome) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const validOutcomes = ["pending", "completed", "missed"];
      if (!validOutcomes.includes(outcome)) {
        return res.status(400).json({ success: false, message: "Invalid outcome value" });
      }

      const updateData = { outcome };
      if (outcome === "completed") {
        updateData.feedbackRemarks = feedbackRemarks || "";
        updateData.interestLevel = interestLevel || "";
        updateData.missedReason = "";
        updateData.missedReasonDetails = "";
      } else if (outcome === "missed") {
        updateData.missedReason = missedReason || "";
        updateData.missedReasonDetails = missedReasonDetails || "";
        updateData.feedbackRemarks = "";
        updateData.interestLevel = "";
      }

      const updatedFollowUp = await FollowUp.findByIdAndUpdate(
        followUpId,
        updateData,
        { new: true }
      );

      if (!updatedFollowUp) {
        return res.status(404).json({ success: false, message: "Follow-up not found" });
      }

      // --- mForm Feedback Integration ---
      if (updatedFollowUp.followUpType === "site visit" && outcome === "completed") {
         const leadForFeedback = await Lead.findById(updatedFollowUp.leadId).populate("assignedTo", "name");
         if (leadForFeedback && process.env.MFORM_API_URL && process.env.MFORM_API_KEY && process.env.MFORM_SITE_VISIT_FORM_ID) {
            try {
               const mformRes = await fetch(`${process.env.MFORM_API_URL}/api/external/v0/forms/${process.env.MFORM_SITE_VISIT_FORM_ID}/invites`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.MFORM_API_KEY
                  },
                  body: JSON.stringify({
                    name: leadForFeedback.fullName || '',
                    phone: leadForFeedback.phone || '',
                    email: leadForFeedback.email || ''
                  })
               });
               const mformData = await mformRes.json();
               if (mformData.success && mformData.url) {
                  const feedbackUrl = mformData.url;
                  const feedbackToken = mformData.token;
                  
                  // Save url + token in followUp
                  updatedFollowUp.feedbackFormUrl = feedbackUrl;
                  updatedFollowUp.feedbackToken = feedbackToken;
                  await updatedFollowUp.save();

                   // Send WhatsApp
                   if (leadForFeedback.phone) {
                     const agentName = leadForFeedback.assignedTo?.name || "our agent";
                     await sendSiteVisitFeedbackWhatsappMessage(
                       leadForFeedback.phone,
                       leadForFeedback.fullName,
                       leadForFeedback.propertyName || "the property",
                       agentName,
                       feedbackUrl
                     );
                   }
                  
                  // Send Email
                  if (leadForFeedback.email) {
                    await sendSiteVisitFeedbackEmail(leadForFeedback.email, leadForFeedback.fullName, feedbackUrl);
                  }
               }
            } catch (err) {
               console.error("[FollowUpService] Failed to generate mForm feedback link:", err);
            }
         }
      }
      // ----------------------------------

      return res.status(200).json({ success: true, data: updatedFollowUp, message: "Outcome updated successfully" });
    } catch (error) {
      console.error("[FollowUpService] Update Outcome Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetches the mForm feedback submission for a completed site visit.
   * The CRM calls mForm's external API using the stored feedbackToken.
   * Query: ?followUpId=<id>
   */
  async getFeedbackSubmission(req, res) {
    try {
      await dbConnect();
      const { followUpId } = req.query;

      if (!followUpId) {
        return res.status(400).json({ success: false, message: "followUpId is required" });
      }

      const followUp = await FollowUp.findById(followUpId);
      if (!followUp) {
        return res.status(404).json({ success: false, message: "Follow-up not found" });
      }

      if (!followUp.feedbackToken) {
        return res.status(200).json({ success: true, data: null, message: "No feedback link was generated for this follow-up" });
      }

      const { MFORM_API_URL, MFORM_API_KEY, MFORM_SITE_VISIT_FORM_ID } = process.env;
      if (!MFORM_API_URL || !MFORM_API_KEY || !MFORM_SITE_VISIT_FORM_ID) {
        return res.status(500).json({ success: false, message: "mForm integration is not configured" });
      }

      const mformRes = await fetch(
        `${MFORM_API_URL}/api/external/v0/forms/${MFORM_SITE_VISIT_FORM_ID}/invites/${followUp.feedbackToken}`,
        { headers: { "x-api-key": MFORM_API_KEY } }
      );

      const mformData = await mformRes.json();

      return res.status(mformRes.status).json({
        success: mformData.success,
        invite: mformData.invite,
        submission: mformData.submission || null,
        feedbackFormUrl: followUp.feedbackFormUrl,
      });

    } catch (error) {
      console.error("[FollowUpService] getFeedbackSubmission Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default FollowUpService;
