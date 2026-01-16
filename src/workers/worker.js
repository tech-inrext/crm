import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import bulkUploadLeads from "./bulkupload.js";
import sendOTPJob from "./sendOTPJob.js";
import sendNotificationEmail from "./sendNotificationEmail.js";
import notificationCleanupJob from "./notificationCleanup.js";
import sendLeadFollowUpNotification from "./sendLeadFollowUpNotification.js";
import { leadQueue } from "../queue/leadQueue.js";
import bulkAssignLeads from "./bulkAssignLeads.js";

import revertBulkAssign from "./revertBulkAssign.js";
import dbConnect from "../lib/mongodb.js";
import checkFollowUpsJob from "./checkFollowUpsJob.js";

// Initialize DB Connection
dbConnect()
  .then(async () => {
    console.log("📦 Worker connected to MongoDB");

    // 🛠️ Ensure the Schedule exists for the Scalable Poller
    // We run this once on worker startup.
    if (leadQueue) {
      // Remove previous job to update schedule if needed (optional)
      // await leadQueue.removeRepeatable("checkFollowUps", { every: 60000 });

      await leadQueue.add(
        "checkFollowUps",
        {},
        {
          repeat: {
            every: 60000, // Run every 60 seconds
          },
          jobId: "checkFollowUps-cron",
        }
      );

      // ⚡ Trigger immediately once on startup
      await leadQueue.add(
        "checkFollowUps",
        {},
        {
          jobId: `checkFollowUps-init-${Date.now()}`,
        }
      );

      console.log("⏰ Scheduled checkFollowUps job (Immediate + Every 60s)");
    }
  })
  .catch((err) => console.error("❌ Worker failed to connect to MongoDB", err));

// 🛠️ Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 🔗 Redis Connection
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ workers
  tls: redisUrl.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
});

connection.on("error", (err) => {
  console.error("❌ Worker Redis Connection Error:", err.message);
});

connection.on("connect", () => {
  console.log("✅ Worker connected to Redis");
});

class InrextWorker extends Worker {
  constructor() {
    super("leadQueue", async (job) => this.jobsMapper(job), { connection });
    this.jobMethods = [];
  }
  async jobsMapper(job) {
    const jobName = job.name;
    // Fix: We MUST check for the function and AWAIT its completion
    if (typeof this[jobName] === "function") {
      try {
        console.log(`🚀 Executing ${jobName}...`);
        await this[jobName](job); // <--- THE CRITICAL FIX: Add 'await'
        console.log(`✅ ${jobName} finished successfully.`);
      } catch (error) {
        console.error(`❌ ${jobName} failed:`, error.message);
        throw error; // Let BullMQ know it failed so it can retry
      }
    } else {
      console.error(`🚨 No handler found for job: ${jobName}`);
    }
  }
  addJobListener(jobName, cb) {
    if (this.jobMethods.includes(jobName)) {
      throw "Job already added";
    }
    this[jobName] = cb;
  }
}

const worker = new InrextWorker();
worker.addJobListener("bulkUploadLeads", bulkUploadLeads);
worker.addJobListener("sendOTPJob", sendOTPJob);
worker.addJobListener("sendNotificationEmail", sendNotificationEmail);
worker.addJobListener("notificationCleanup", notificationCleanupJob);
worker.addJobListener(
  "sendLeadFollowUpNotification",
  sendLeadFollowUpNotification
);
worker.addJobListener("bulkAssignLeads", bulkAssignLeads);
worker.addJobListener("revertBulkAssign", revertBulkAssign);
worker.addJobListener("checkFollowUps", checkFollowUpsJob);

// Event Listeners for Debugging
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.name} failed (ID: ${job.id}):`, err);
});

worker.on("error", (err) => {
  console.error("❌ Worker Error:", err);
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.name} completed (ID: ${job.id})`);
});

// Schedule periodic cleanup tasks
const scheduleCleanupTasks = () => {
  if (!leadQueue) {
    console.warn("Queue not available, skipping cleanup scheduling");
    return;
  }

  // Schedule hourly cleanup for expired notifications
  setInterval(() => {
    leadQueue.add("notificationCleanup", { action: "expired" });
  }, 60 * 60 * 1000); // Every hour

  // Schedule daily cleanup for old notifications
  setInterval(() => {
    leadQueue.add("notificationCleanup", { action: "all" });
  }, 24 * 60 * 60 * 1000); // Every 24 hours

  console.log("Notification cleanup tasks scheduled");
};

// Start cleanup scheduling
scheduleCleanupTasks();

export default worker;
