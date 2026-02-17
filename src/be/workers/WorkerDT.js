import dotenv from "dotenv";
import path from "path";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { leadQueue } from "../queue/leadQueue.js";
import dbConnect from "../../lib/mongodb.js";

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

  async isStable() {
    console.log("Checking worker stability...");
    try {
      await dbConnect();
      console.log("✅ Database connected successfully");
    } catch (err) {
      console.error("❌ Database connection failed:", err.message);
      process.exit(1);
    }

    try {
      await connection.ping();
      console.log("✅ Redis connected successfully");
    } catch (err) {
      console.error("❌ Redis connection failed:", err.message);
      process.exit(1);
    }
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

  async addCron(jobName, interval, id, param={}) {
    if (leadQueue) {
      await leadQueue.add(
        jobName,
        param,
        {
          repeat: { every: interval },
          jobId: id,
        }
      );
    }
  }
}

const worker = new InrextWorker();
await worker.isStable();
worker.on("failed", (job, err) =>
  console.error(`Job ${job.name} failed:`, err)
);
worker.on("error", (err) => console.error("Worker error:", err));
worker.on("completed", (job) => console.log(`Job ${job.name} completed`));


export { worker };