import { uploadToS3 } from "@/lib/s3";
import dbConnect from "@/lib/mongodb";
import BulkUpload from "@/models/BulkUpload";
import { NextApiRequest, NextApiResponse } from "next";
import xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  try {
    const upload = await BulkUpload.findById(id);
    if (!upload)
      return res.status(404).json({ message: "Upload not found" });

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
