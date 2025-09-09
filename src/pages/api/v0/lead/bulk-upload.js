import mongoose from "mongoose";
import { leadQueue } from "../../../../queue/leadQueue";
import { loginAuth } from "../../../../middlewares/loginAuth";
import BulkUpload from "../../../../models/BulkUpload";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  // move to middleware
  await new Promise((resolve, reject) => {
    loginAuth(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });

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
};

export default handler;
