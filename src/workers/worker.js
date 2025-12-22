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

// 🛠️ Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 🔗 Redis Connection
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ workers
  tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
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
  jobsMapper(job) {
    const jobName = job.name;
    if (typeof this[jobName] === "function") {
      this[jobName](job);
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
worker.addJobListener("sendLeadFollowUpNotification", sendLeadFollowUpNotification);
worker.addJobListener("bulkAssignLeads", bulkAssignLeads);
worker.addJobListener("revertBulkAssign", revertBulkAssign);

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
