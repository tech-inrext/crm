import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

// 🔧 Configure Multer for file upload (store in /uploads folder)
const upload = multer({ dest: "uploads/" });

// 🛠 Helper function to read Excel and convert to JSON
const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};

// ✅ Bulk Upload Handler
const handler = async (req, res) => {
  await dbConnect();

  // Handle only POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  // Use multer to handle file upload
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({
          success: false,
          message: "File upload failed",
          error: err.message,
        });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const filePath = path.join(process.cwd(), req.file.path);

    try {
      const rows = parseExcel(filePath);
      const leadsToInsert = [];

      for (const row of rows) {
        if (!row.phone) continue; // Skip if phone is missing

        // Check if phone already exists
        const existing = await Lead.findOne({ phone: row.phone });
        if (existing) continue;

        // Generate a unique leadId
        const leadId = `LD-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;

        leadsToInsert.push({
          leadId,
          fullName: row.fullName || "",
          email: row.email || "",
          phone: row.phone,
          propertyType: row.propertyType,
          location: row.location,
          budgetRange: row.budgetRange,
          status: row.status || "New",
          source: row.source,
          assignedTo: row.assignedTo || null,
          followUpNotes: [],
          nextFollowUp: row.nextFollowUp ? new Date(row.nextFollowUp) : null,
        });
      }

      if (leadsToInsert.length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "No valid or new leads to insert.",
          });
      }

      // Insert into database
      await Lead.insertMany(leadsToInsert);

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      return res.status(201).json({
        success: true,
        message: `${leadsToInsert.length} leads uploaded successfully.`,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Bulk upload failed",
          error: error.message,
        });
    }
  });
};

export const config = {
  api: {
    bodyParser: false, // Required for multer to handle multipart/form-data
  },
};

export default handler;
