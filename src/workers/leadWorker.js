import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import dbConnect from "../lib/mongodb.js";
import Lead from "../models/Lead.js";
import BulkUpload from "../models/BulkUpload.js";

// 🛠️ Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 🔗 Redis Connection
const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  }
);

// 🎯 Lead Processing Worker
const worker = new Worker(
  "leadQueue",
  async (job) => {
    const { leads, uploadedBy, uploadId } = job.data;
    await dbConnect();
    await Lead.init();

    console.log(`\n👷 Started processing uploadId: ${uploadId}`);
    console.log(`📊 Total leads in job: ${leads.length}\n`);

    const uploaded = [];
    const duplicates = [];
    const invalidPhones = [];
    const otherErrors = [];

    for (const row of leads) {
      const phone = String(
        row.phone || row.Phone || row["Mobile Number"] || row["Phone Number"]
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

      const lead = new Lead({
        leadId: `LD-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`,
        fullName: row.fullName || row.name || "",
        email: row.email || "",
        phone,
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
        console.error("❌ BulkUpload record not found for ID:", uploadId);
        return;
      }

      bulkUpload.uploaded = uploaded.length;
      bulkUpload.duplicates = duplicates.length;
      bulkUpload.invalidPhones = invalidPhones.length;
      bulkUpload.otherErrors = otherErrors.length;
      bulkUpload.details = {
        uploaded,
        duplicates,
        invalidPhones,
        otherErrors,
      };

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

    return {
      message: `${leads.length} leads processed.`,
      total: leads.length,
      uploaded: uploaded.length,
      duplicates: duplicates.length,
      invalidPhones: invalidPhones.length,
      otherErrors: otherErrors.length,
      details: {
        uploaded,
        duplicates,
        invalidPhones,
        otherErrors,
      },
    };
  },
  {
    connection,
  }
);
