import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import mongoose from "mongoose"; // ✅ Add this
import { v4 as uuidv4 } from "uuid";
import { leadQueue } from "../../../../queue/leadQueue";
import { loginAuth } from "../../../../middlewares/loginAuth";
import BulkUpload from "../../../../models/BulkUpload";

const upload = multer({ dest: "uploads/" });

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};

const writePlaceholderExcelFile = (uploadId) => {
  const workbook = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet([["Processing..."]]);
  xlsx.utils.book_append_sheet(workbook, ws, "Status");

  const fileName = `${uploadId}-${uuidv4()}.xlsx`;
  const filePath = path.join(process.cwd(), "uploads", fileName);
  xlsx.writeFile(workbook, filePath);

  return {
    filePath,
    fileUrl: `/uploads/${fileName}`,
  };
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

  upload.single("file")(req, res, async (err) => {
    if (err || !req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File upload failed" });
    }

    const filePath = path.join(process.cwd(), req.file.path);

    try {
      const rows = parseExcel(filePath);
      const uploaderId = req.employee?._id || "000000000000000000000001";

      // ✅ Generate _id and unique file name first
      const uploadId = new mongoose.Types.ObjectId();
      const uniqueFileName = `${uploadId}-${uuidv4()}.xlsx`;

      // ✅ Create placeholder Excel file using the actual _id
      const { fileUrl } = writePlaceholderExcelFile(uploadId);

      // ✅ Create BulkUpload entry using the same _id and fileUrl
      const bulkUploadRecord = await BulkUpload.create({
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
        reportFileName: uniqueFileName,
      });

      // ✅ Send job to queue
      await leadQueue.add(
        "bulkInsert",
        {
          leads: rows,
          uploadedBy: uploaderId,
          uploadId,
        },
        { attempts: 1 }
      );

      fs.unlinkSync(filePath); // Clean up uploaded input

      return res.status(200).json({
        success: true,
        message: `✅ File received. Leads are being processed in background.`,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
