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
    this.retryIntervals = {};
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
  _calculateInterval(intervalStr) {
    const match = intervalStr.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(
        "Invalid interval format. Use formats like '10s', '5m', '2h', '1d'."
      );
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const unitMap = {
      s: 1000, // seconds to milliseconds
      m: 60 * 1000, // minutes to milliseconds
      h: 60 * 60 * 1000, // hours to milliseconds
      d: 24 * 60 * 60 * 1000, // days to milliseconds
    };

    if (!unitMap[unit]) {
      throw new Error(
        `Invalid time unit '${unit}'. Use 's' (seconds), 'm' (minutes), 'h' (hours), or 'd' (days).`
      );
    }

    return value * unitMap[unit];
  }
  registerAsRecurringJob(jobName, timeInterval, params) {
    if (leadQueue === undefined) {
      this.retryIntervals[jobName] = { timeInterval, params };
      console.warn(
        `⚠️ Queue not available. Will retry registering job: ${jobName} later.`
      );
      return;
    }
    // Calculate interval in milliseconds
    const intervalMs = this._calculateInterval(timeInterval);

    // Schedule the recurring job
    setInterval(() => {
      leadQueue.add(jobName, params);
    }, intervalMs);

    console.log(
      `✅ Registered recurring job: ${jobName} (interval: ${timeInterval})`
    );
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

// Schedule periodic cleanup tasks
const scheduleCleanupTasks = () => {
  if (!leadQueue) {
    console.warn("Queue not available, skipping cleanup scheduling");
    return;
  }

  // Schedule hourly cleanup for expired notifications
  worker.registerAsRecurringJob("notificationCleanup", "1h", {
    action: "expired",
  });

  // Schedule daily cleanup for all notifications
  worker.registerAsRecurringJob("notificationCleanup", "1d", {
    action: "all",
  });

  console.log("📅 Cleanup tasks scheduled");
};

// Start cleanup scheduling
scheduleCleanupTasks();
