import dotenv from "dotenv";
import path from "path";
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
import dbConnect from "../../lib/mongodb.js";
import checkFollowUpsJob from "./checkFollowUpsJob.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: redisUrl.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
});

connection.on("error", (err) =>
  console.error("Redis connection error:", err.message)
);
connection.on("connect", () => console.log("Worker connected to Redis"));

class InrextWorker extends Worker {
  constructor() {
    super("leadQueue", async (job) => this.jobsMapper(job), { connection });
  }

  async jobsMapper(job) {
    if (typeof this[job.name] === "function") {
      try {
        await dbConnect(); // ✅ Ensure DB is connected before processing
        console.log(`Executing ${job.name}...`);
        await this[job.name](job);
        console.log(`${job.name} completed`);
      } catch (error) {
        console.error(`${job.name} failed:`, error.message);
        throw error;
      }
    } else {
      console.error(`No handler for job: ${job.name}`);
    }
  }

  addJobListener(jobName, cb) {
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

worker.on("failed", (job, err) =>
  console.error(`Job ${job.name} failed:`, err)
);
worker.on("error", (err) => console.error("Worker error:", err));
worker.on("completed", (job) => console.log(`Job ${job.name} completed`));

dbConnect()
  .then(async () => {
    console.log("Worker connected to MongoDB");

    if (leadQueue) {
      await leadQueue.add(
        "checkFollowUps",
        {},
        {
          repeat: { every: 60000 },
          jobId: "checkFollowUps-cron",
        }
      );
      await leadQueue.add(
        "checkFollowUps",
        {},
        {
          jobId: `checkFollowUps-init-${Date.now()}`,
        }
      );
      console.log("Scheduled checkFollowUps job");

      setInterval(
        () => leadQueue.add("notificationCleanup", { action: "expired" }),
        60 * 60 * 1000
      );
      setInterval(
        () => leadQueue.add("notificationCleanup", { action: "all" }),
        24 * 60 * 60 * 1000
      );
      console.log("Notification cleanup scheduled");
    }
  })
  .catch((err) => console.error("Worker failed to connect to MongoDB", err));

export default worker;
