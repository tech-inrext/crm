import { Service } from "@framework";
import { leadQueue } from "../../queue/leadQueue";
import LeadAssignmentHistory from "../../models/LeadAssignmentHistory";
import Lead from "../../models/Lead";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import xlsx from "xlsx";

class BulkAssignService extends Service {
  constructor() {
    super();
  }

  async checkLeadAvailability(req, res) {
    try {
      const { status } = req.query;
      if (!status) return res.status(400).json({ success: false, message: "Status is required" });

      const count = await Lead.countDocuments({
        status,
        uploadedBy: req.employee?._id, // Only select leads uploaded by me
        $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
      });

      return res.status(200).json({ success: true, count });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async bulkAssignLeads(req, res) {
    try {
      const { limit, assignTo, status } = req.body;
      const updatedBy = req.employee?._id;

      if (!limit || !assignTo || !status) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const availableCount = await Lead.countDocuments({
        status,
        uploadedBy: updatedBy, // Only select leads uploaded by me
        $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
      });

      if (availableCount === 0) {
        return res.status(404).json({
          success: false,
          message: `No unassigned leads found with status "${status}".`,
        });
      }

      const actualLimit = Math.min(limit, availableCount);
      const isPartial = availableCount < limit;
      const batchId = uuidv4();

      await leadQueue.add(
        "bulkAssignLeads",
        {
          batchId,
          limit: actualLimit,
          assignTo,
          status,
          updatedBy,
          availableCount, // Pass the count we found to the worker
        },
        {
          attempts: 3,
          removeOnComplete: true,
        }
      );

      let responseMessage = "Bulk assignment started in background.";
      if (isPartial) {
        responseMessage = `You requested ${limit} leads, but only ${availableCount} unassigned leads with status "${status}" were found. Assigning all ${availableCount} leads.`;
      } else {
          responseMessage = `Bulk assignment of ${limit} leads started.`;
      }

      return res.status(200).json({
        success: true,
        message: responseMessage,
        batchId,
      });
    } catch (error) {
      console.error("Bulk Assign Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async revertBulkAssign(req, res) {
    try {
      const { batchId } = req.body;
      const revertedBy = req.employee?._id;

      if (!batchId) {
        return res.status(400).json({ success: false, message: "Missing batchId" });
      }

      // Security Check: Verify this batch belongs to the user
      const batchExists = await LeadAssignmentHistory.findOne({ batchId, updatedBy: revertedBy });
      if (!batchExists) {
        return res.status(403).json({ success: false, message: "Unauthorized to revert this batch" });
      }

      // Time Check: 24 hour limit
      const now = new Date();
      const createdAt = new Date(batchExists.createdAt);
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursElapsed >= 24) {
        return res.status(400).json({ success: false, message: "Revert period (24 hours) has expired" });
      }

      await leadQueue.add(
        "revertBulkAssign",
        {
          batchId,
          revertedBy,
        },
        {
          attempts: 3,
          removeOnComplete: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Revert process started in background.",
      });
    } catch (error) {
      console.error("Revert Assign Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async downloadBatchReport(req, res) {
    try {
      const { batchId } = req.query;
      if (!batchId) return res.status(400).json({ message: "Missing batchId" });

      const historyRecords = await LeadAssignmentHistory.find({
        batchId,
        actionType: "ASSIGN",
        updatedBy: req.employee?._id // Security Check
      }).populate({
        path: "leadId",
        select: "fullName phone email location status propertyType budgetRange",
      }).populate({
        path: "newAssignedTo",
        select: "name email",
      }).populate({
        path: "previousAssignedTo",
        select: "name email",
      });

      const data = historyRecords.map(record => {
          const lead = record.leadId || {};
          return {
              "Lead Name": lead.fullName || "N/A",
              "Phone": lead.phone || "N/A",
              "Email": lead.email || "N/A",
              "Location": lead.location || "N/A",
              "Property Type": lead.propertyType || "N/A",
              "Budget": lead.budgetRange || "N/A",
              "Status": lead.status || "N/A",
              "Assigned To": record.newAssignedTo?.name || "Unassigned",
              "Previous Owner": record.previousAssignedTo?.name || "Unassigned",
              "Assigned Date": record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"
          };
      });

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(wb, ws, "Batch Leads");

      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Disposition", `attachment; filename="batch_${batchId}.xlsx"`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);

    } catch (error) {
      console.error("Download Error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getAssignmentHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get total count for pagination
      const totalCountAgg = await LeadAssignmentHistory.aggregate([
        { 
          $match: { 
            actionType: "ASSIGN",
            updatedBy: new mongoose.Types.ObjectId(req.employee?._id)
          } 
        },
        { $group: { _id: "$batchId" } },
        { $count: "total" }
      ]);
      const total = totalCountAgg[0]?.total || 0;

      // Aggregate to group by batchId and get details
      const history = await LeadAssignmentHistory.aggregate([
        { 
          $match: { 
            actionType: "ASSIGN",
            updatedBy: new mongoose.Types.ObjectId(req.employee?._id)
          } 
        }, // Only show original assignments belonging to this user
        {
          $group: {
            _id: "$batchId",
            count: { $sum: 1 },
            timestamp: { $first: "$createdAt" },
            updatedBy: { $first: "$updatedBy" },
            assignTo: { $first: "$newAssignedTo" },
          },
        },
        { $sort: { timestamp: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        // ... rest of lookups
        {
            $lookup: {
                from: "employees",
                localField: "updatedBy",
                foreignField: "_id",
                as: "performer"
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "assignTo",
                foreignField: "_id",
                as: "assignee"
            }
        },
        // Check if this batch has been reverted
        {
            $lookup: {
                from: "leadassignmenthistories",
                let: { batchId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$batchId", "$$batchId"] },
                                    { $eq: ["$actionType", "REVERT"] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: "revertInfo"
            }
        },
        {
            $project: {
                batchId: "$_id",
                count: 1,
                timestamp: 1,
                performerName: { $arrayElemAt: ["$performer.name", 0] },
                assigneeName: { $arrayElemAt: ["$assignee.name", 0] },
                isReverted: { $gt: [{ $size: "$revertInfo" }, 0] }
            }
        }
      ]);

      return res.status(200).json({
        success: true,
        data: history,
        total: total,
      });
    } catch (error) {
      console.error("Get History Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default BulkAssignService;
