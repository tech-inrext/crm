// /api/v0/lead/download-report/[id].ts

import dbConnect from "@/lib/mongodb";
import BulkUpload from "@/models/BulkUpload";
import { writeFileSync, unlink } from "fs";
import { join } from "path";
import { NextApiRequest, NextApiResponse } from "next";
import xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    // ✅ Save file in public/
    const uniqueFileName = `report_${id}_${uuidv4()}.xlsx`;
    const filePath = join(process.cwd(), "public", uniqueFileName);

    writeFileSync(
      filePath,
      xlsx.write(wb, { type: "buffer", bookType: "xlsx" })
    );

    // ✅ Save file name in MongoDB (optional, for listing UI)
    upload.reportFileName = uniqueFileName;
    await upload.save();

    // ✅ Auto-delete file after 2 mins
    setTimeout(() => {
      unlink(filePath, (err) => {
        if (err) console.error("❌ Error deleting file:", uniqueFileName, err);
        else console.log("🧹 File cleaned up:", uniqueFileName);
      });
    }, 2 * 60 * 1000); // 2 mins

    // ✅ Return download URL
    return res.status(200).json({ downloadUrl: `/${uniqueFileName}` });

  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
