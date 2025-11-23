import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import bulkUploadLeads from "./bulkupload.js";
import sendOTPJob from "./sendOTPJob.js";
import sendNotificationEmail from "./sendNotificationEmail.js";
import notificationCleanupJob from "./notificationCleanup.js";
import { leadQueue } from "../queue/leadQueue.js";

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
