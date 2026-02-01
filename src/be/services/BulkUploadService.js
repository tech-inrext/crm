import { Service } from "@framework";
import BulkUpload from "../models/BulkUpload";
import { leadQueue } from "../queue/leadQueue";
import mongoose from "mongoose";
import { uploadToS3 } from "@/lib/s3";
import xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";

class BulkUploadService extends Service {
  constructor() {
    super();
  }
  async bulkUploadLeads(req, res) {
    try {
      const { fileUrl, fileName } = req.body;
      if (!fileUrl || !fileName) {
        return res
          .status(400) // bad request
          .json({ success: false, message: "Missing fileUrl or fileName" });
      }

      const uploaderId = req.employee?._id;
      const uploadId = new mongoose.Types.ObjectId();

      await BulkUpload.create({
        _id: uploadId,
        uploadedBy: uploaderId,
        totalRecords: 0,
        uploaded: 0,
        duplicates: 0,
        invalidPhones: 0, // Move to model default values
        otherErrors: 0,
        details: {
          uploaded: [],
          duplicates: [],
          invalidPhones: [],
          otherErrors: [],
        },
        status: "In Queue",
        fileUrl,
        reportFileName: fileName,
      });

      await leadQueue.add(
        "bulkUploadLeads",
        {
          uploadId,
          fileUrl,
          uploadedBy: uploaderId,
        },
        {
          attempts: 3, // optional: a bit more resilient
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      return res.status(200).json({
        success: true,
        message: `✅ File received. Leads are being processed in background.`,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUploadStatus(req, res) {
    try {
      const loggedInUserId = req.employee?._id;

      // Pagination query params
      const { page = 1, limit = 5 } = req.query;
      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (currentPage - 1) * itemsPerPage;

      // Get paginated uploads
      const [uploads, total] = await Promise.all([
        BulkUpload.find({ uploadedBy: loggedInUserId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(itemsPerPage)
          .populate("uploadedBy", "name email"),
        BulkUpload.countDocuments({ uploadedBy: loggedInUserId }),
      ]);

      res.status(200).json({
        success: true,
        count: uploads.length,
        data: uploads,
        pagination: {
          totalItems: total,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(total / itemsPerPage),
        },
      });
    } catch (error) {
      console.error("Error fetching bulk uploads:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching bulk uploads.",
      });
    }
  }

  async downloadUploadReport(req, res) {
    const { id } = req.query;

    try {
      const upload = await BulkUpload.findById(id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      const data = [
        ...upload.details.uploaded.map((phone) => ({
          Phone: phone,
          Status: "Uploaded",
        })),
        ...upload.details.duplicates.map((item) => ({
          Phone: item.phone,
          Status: "Not Uploaded",
          Reason: item.reason,
        })),
        ...upload.details.invalidPhones.map((item) => ({
          Phone: item.phone,
          Status: "Not Uploaded",
          Reason: item.reason,
        })),
        ...upload.details.otherErrors.map((item) => ({
          Phone: item.phone,
          Status: "Not Uploaded",
          Reason: item.reason,
        })),
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(wb, ws, "Report");

      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
      const key = `reports/report_${id}_${uuidv4()}.xlsx`;

      const publicUrl = await uploadToS3(
        buffer,
        key,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      upload.reportFileName = key;
      await upload.save();

      // ✅ Return the existing file URL and file name
      return res.status(200).json({
        fileUrl: publicUrl,
        fileName: upload.reportFileName || `report_${id}.xlsx`,
      });
    } catch (err) {
      console.error("❌ Server error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default BulkUploadService;
