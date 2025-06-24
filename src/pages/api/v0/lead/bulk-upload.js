import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const upload = multer({ dest: "uploads/" });

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};

const handler = async (req, res) => {
  await dbConnect();
  // await Lead.init();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  upload.single("file")(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({
        success: false,
        message: "File upload failed",
        error: err?.message || "No file uploaded",
      });
    }

    const filePath = path.join(process.cwd(), req.file.path);

    try {
      const rows = parseExcel(filePath);
      const uploaded = [];
      const failed = [];

      for (const row of rows) {
        const phone = String(row.phone).trim();

        // Optional: skip invalid phone numbers early
        // if (!/^\d{10,15}$/.test(phone)) {
        //   failed.push({ phone, reason: "Invalid phone number" });
        //   continue;
        // }

        const lead = new Lead({
          leadId: `LD-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`,
          fullName: row.fullName || "",
          email: row.email || "",
          phone: phone,
          propertyType: row.propertyType || "",
          location: row.location || "",
          budgetRange: row.budgetRange || "",
          status: row.status || "New",
          source: row.source || "",
          assignedTo: row.assignedTo || null,
          followUpNotes: [],
          nextFollowUp: row.nextFollowUp ? new Date(row.nextFollowUp) : null,
        });

        try {
          await lead.save();
          uploaded.push({ phone, name: lead.fullName });
        } catch (saveError) {
          failed.push({
            phone,
            name: lead.fullName || "N/A",
            reason:
              saveError.code === 11000 ? "Duplicate phone" : saveError.message,
          });
        }
      }

      fs.unlinkSync(filePath); // Cleanup

      return res.status(200).json({
        success: true,
        message:
          uploaded.length === 0
            ? "No new leads were saved. All entries may be duplicates or invalid."
            : `${uploaded.length} lead(s) saved successfully.`,
        uploaded,
        failed: failed,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Bulk upload failed",
        error: error.message,
      });
    }
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
