import { Service } from "@framework";
import dbConnect from "../../lib/mongodb";
import FollowUp from "../../models/FollowUp";
import CabBooking from "../../models/CabBooking";
import Lead from "../../models/Lead";
import mongoose from "mongoose";
import { scheduleFollowUpNotifications } from "../utils/scheduleFollowUpNotifications.js";

class SiteVisitService extends Service {
  async getLeadId(identifier) {
    if (!identifier) return null;
    const identifierStr = String(identifier);

    // 1. If it's already a valid ObjectId hex string, check if it exists as _id
    if (mongoose.Types.ObjectId.isValid(identifierStr)) {
      const byId = await Lead.findById(identifierStr);
      if (byId) return byId._id;
    }

    // 2. Try to find by custom leadId (string)
    const byCustomId = await Lead.findOne({ leadId: identifierStr });
    if (byCustomId) return byCustomId._id;

    return null;
  }

  async createSiteVisit(req, res) {
    try {
      await dbConnect();

      const {
        leadId,
        project,
        clientName,
        requestedDateTime,
        notes,
        cabRequired,
        // Cab specific
        numberOfClients,
        pickupPoint,
        dropPoint,
        dropPoint,
      } = req.body;

      console.log("[SiteVisit] POST Request:", {
        leadId,
        cabRequired,
        project,
      });
      console.log("[SiteVisit] POST Request:", {
        leadId,
        cabRequired,
        project,
      });

      // 1. Validate Basic Fields
      if (!leadId || !clientName || !requestedDateTime) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // 2. Validate Cab Fields
      if (cabRequired) {
        if (!project || !numberOfClients || !pickupPoint || !dropPoint) {
<<<<<<< HEAD
          return res
            .status(400)
            .json({ success: false, message: "Missing cab booking details" });
        }
      }

      // 3. Resolve Lead ID
      const targetLeadId = await this.getLeadId(leadId);
      if (!targetLeadId) {
        return res
          .status(404)
          .json({ success: false, message: "Lead not found" });
        return res
          .status(404)
          .json({ success: false, message: "Lead not found" });
      }

      // 4. Get Current User
      const currentUser = req.employee || req.user;
      if (!currentUser) {
        console.error("[SiteVisit] No user found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const rawUserId = currentUser._id || currentUser.id;
      const userId = new mongoose.Types.ObjectId(rawUserId);

      // 5. Create Cab Booking FIRST if required (to get its ID)
      let createdCabBookingId = null;

      if (cabRequired) {
        // Determine Manager ID safely
        let managerId = null;
        if (currentUser.reportsTo) {
          // Handle if reportsTo is populated object or just ID
          managerId = currentUser.reportsTo._id || currentUser.reportsTo;
        } else if (currentUser.managerId) {
          managerId = currentUser.managerId;
        }

        // Fallback to self if no manager (e.g. Admin)
        if (!managerId) {
          managerId = userId;
        }

        // Ensure managerId is ObjectId
        const validManagerId = new mongoose.Types.ObjectId(managerId);

        const cabBooking = new CabBooking({
          cabBookedBy: userId,
          leadId: targetLeadId,
          project,
          clientName,
          numberOfClients,
          pickupPoint,
          dropPoint,
          requestedDateTime,
          notes: notes,
          status: "pending",
          status: "pending",
          managerId: validManagerId,
        });

        const savedCab = await cabBooking.save();
        createdCabBookingId = savedCab._id;
      }

      // 6. Create FollowUp Entry (now with optional cabBookingId)
      const newFollowUp = new FollowUp({
        leadId: targetLeadId,
        followUpDate: requestedDateTime,
        note: notes || "Site Visit Scheduled",
        submittedBy: userId,
        followUpType: "site visit",
        cabBookingId: createdCabBookingId, // Link!
      });

      await newFollowUp.save();

      // Schedule site visit notifications
      if (requestedDateTime && new Date(requestedDateTime) > new Date()) {
        try {
          console.log(
            `[SiteVisitService] Scheduling notifications for lead ${targetLeadId}, date: ${requestedDateTime}`
          );
          await scheduleFollowUpNotifications(
            targetLeadId,
            requestedDateTime,
            "site visit"
          );
          console.log(
            `[SiteVisitService] ✅ Successfully scheduled notifications for lead ${targetLeadId}`
          );
          console.log(
            `[SiteVisitService] Scheduling notifications for lead ${targetLeadId}, date: ${requestedDateTime}`
          );
          await scheduleFollowUpNotifications(
            targetLeadId,
            requestedDateTime,
            "site visit"
          );
          console.log(
            `[SiteVisitService] ✅ Successfully scheduled notifications for lead ${targetLeadId}`
          );
        } catch (error) {
          console.error(
            "[SiteVisitService] ⚠️ Failed to schedule notifications:",
            {
              leadId: targetLeadId,
              error: error.message,
              stack: error.stack,
              requestedDateTime,
            }
          );
          console.error(
            "[SiteVisitService] ⚠️ Failed to schedule notifications:",
            {
              leadId: targetLeadId,
              error: error.message,
              stack: error.stack,
              requestedDateTime,
            }
          );
          // Don't fail the request if notification scheduling fails
          // The site visit is still created successfully, notifications can be scheduled manually if needed
          // The site visit is still created successfully, notifications can be scheduled manually if needed
        }
      } else {
        console.log(
          `[SiteVisitService] Skipping notification scheduling - requested time is in the past or invalid`
        );
      } else {
        console.log(
          `[SiteVisitService] Skipping notification scheduling - requested time is in the past or invalid`
        );
      }

      return res
        .status(200)
        .json({ success: true, message: "Site visit scheduled successfully" });
      return res
        .status(200)
        .json({ success: true, message: "Site visit scheduled successfully" });
    } catch (error) {
      console.error("SiteVisitService Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default SiteVisitService;
