import xlsx from "xlsx";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { leadQueue } from "../../../../queue/leadQueue";
import { loginAuth } from "../../../../middlewares/loginAuth";
import BulkUpload from "../../../../models/BulkUpload";

const parseExcelBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  await new Promise((resolve, reject) => {
    loginAuth(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });

  try {
    const { fileUrl, fileName } = req.body;
    console.log("Received in API:", { fileUrl, fileName });
    if (!fileUrl || !fileName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fileUrl or fileName" });
    }

    // Fetch file from S3
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const rows = parseExcelBuffer(Buffer.from(buffer));

    const uploaderId = req.employee?._id || "000000000000000000000001";
    const uploadId = new mongoose.Types.ObjectId();

    await BulkUpload.create({
      _id: uploadId,
      uploadedBy: uploaderId,
      totalRecords: rows.length,
      uploaded: 0,
      duplicates: 0,
      invalidPhones: 0,
      otherErrors: 0,
      details: {
        uploaded: [],
        duplicates: [],
        invalidPhones: [],
        otherErrors: [],
      },
      fileUrl,
      reportFileName: fileName,
    });

    await leadQueue.add(
      "bulkInsert",
      {
        leads: rows,
        uploadedBy: uploaderId,
        uploadId,
      },
      { attempts: 1 }
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
