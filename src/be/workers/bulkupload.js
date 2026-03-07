import Lead from "../models/Lead.js";
import BulkUpload from "../models/BulkUpload.js";
import FollowUp from "../models/FollowUp.js";
import Employee from "../models/Employee.js";
import dbConnect from "../../lib/mongodb.js";
import xlsx from "xlsx";
import mongoose from "mongoose";

const parseExcelBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};

const sleep = () => new Promise((resolve) => setTimeout(resolve, 10_000));

async function bulkUploadLeads(job) {
  console.log("App Started");
  const { uploadId, fileUrl, uploadedBy, managerId } = job.data; // ✅ get uploader id and managerId here

  // Fetch file from S3
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  const leads = parseExcelBuffer(Buffer.from(buffer));

  await dbConnect();
  console.log("Connected to the database successfully.");

  let leadsManagerId = null;
  if (managerId) {
    // Ensure it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(managerId)) {
      leadsManagerId = new mongoose.Types.ObjectId(managerId);
      console.log(`👤 Using ManagerId directly from job: ${leadsManagerId}`);
    } else {
      console.warn(`⚠️ Provided managerId is invalid: ${managerId}`);
    }
  }

  console.log(`\n👷 Started processing uploadId: ${uploadId}`);
  console.log(`📊 Total leads in job: ${leads.length}\n`);

  const uploaded = [];
  const duplicates = [];
  const invalidPhones = [];
  const otherErrors = [];

  const uploadRecord = await BulkUpload.findById(uploadId);
  if (!uploadRecord) {
    console.error("❌ BulkUpload record not found for ID:", uploadId);
    return false;
  }

  uploadRecord.status = "Processing";
  uploadRecord.totalRecords = leads.length;
  await uploadRecord.save();

  await sleep();

  for (const row of leads) {
    const phone = String(
      row.phone ||
      row.Phone ||
      row["Mobile Number"] ||
      row["Phone Number"] ||
      ""
    ).trim();

    if (!phone) {
      console.warn("⚠️ Missing phone number field in row:", row);
      otherErrors.push({ phone: "", reason: "Missing phone field" });
      continue;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      console.warn("❌ Invalid phone format:", phone);
      invalidPhones.push({ phone, reason: "Invalid Number" });
      continue;
    }

    const leadIdStr = `LD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const lead = new Lead({
      leadId: leadIdStr,
      uploadedBy, // ✅ set uploader from job
      fullName: row.fullName || row.name || "",
      email: row.email || "",
      phone,
      propertyType: row.propertyType || "",
      location: row.location || "",
      budgetRange: row.budgetRange || "",
      status: row.status || "new",
      source: row.source || "",
      assignedTo: row.assignedTo || null,
      managerId: leadsManagerId || null,
    });

    try {
      await lead.save();

      // Sync with FollowUp collection
      const nextFollowUpDate = row.nextFollowUp ? new Date(row.nextFollowUp) : null;
      const followUpNote = row.followUpNote || row.followUpNotes || "N/A";

      if (nextFollowUpDate || (followUpNote && followUpNote !== "N/A")) {
        const followUp = new FollowUp({
          leadId: lead._id,
          followUps: [{
            followUpDate: nextFollowUpDate,
            note: followUpNote,
            submittedBy: uploadedBy // ✅ Track who performed the bulk upload
          }]
        });
        await followUp.save();
      }

      console.log("✅ Lead saved:", phone);
      uploaded.push(phone);
    } catch (e) {
      if (e.code === 11000) {
        console.log("🔁 Duplicate found:", phone);
        duplicates.push({ phone, reason: "Duplicate Number" });
      } else {
        console.error("❌ Error saving lead:", phone, "| Reason:", e.message);
        otherErrors.push({ phone, reason: e.message });
      }
    }
  }

  try {
    const bulkUpload = await BulkUpload.findById(uploadId);
    if (!bulkUpload) {
      console.error("❌ BulkUpload record not found during summary:", uploadId);
      return false;
    }

    bulkUpload.uploaded = uploaded.length;
    bulkUpload.duplicates = duplicates.length;
    bulkUpload.invalidPhones = invalidPhones.length;
    bulkUpload.otherErrors = otherErrors.length;
    bulkUpload.details = { uploaded, duplicates, invalidPhones, otherErrors };
    bulkUpload.status = "Completed";
    await bulkUpload.save();

    console.log("\n✅ BulkUpload summary updated successfully!");
    console.log("📥 Uploaded:", uploaded.length);
    console.log("♻️ Duplicates:", duplicates.length);
    console.log("📛 Invalid Phones:", invalidPhones.length);
    console.log("💥 Other Errors:", otherErrors.length);
    console.log("📌 BulkUpload ID:", bulkUpload._id);
  } catch (err) {
    console.error("❌ Failed to update BulkUpload summary:", err.message);
  }

  return true;
}

export default bulkUploadLeads;
