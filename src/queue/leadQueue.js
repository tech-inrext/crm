import { Queue } from "bullmq";
import IORedis from "ioredis";

// Redis connection with timeout configurations
let connection;
let leadQueue;

try {
  connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    connectTimeout: 10000, // 10 seconds
    lazyConnect: true, // Don't connect immediately
    maxRetriesPerRequest: 3,
    retryDelayOnFailedConnection: 1000,
    enableOfflineQueue: false,
    keepAlive: true,
    // Handle connection errors gracefully
    reconnectOnError: (err) => {
      console.warn("Redis reconnect on error:", err.message);
      return err.message.includes("READONLY"); // Only reconnect on readonly errors
    },
  });

  // Handle Redis connection events
  connection.on("error", (error) => {
    console.warn("Redis connection error (non-blocking):", error.message);
    // Don't throw error, just log it
  });

  connection.on("connect", () => {
    console.log("Redis connected successfully");
  });

  connection.on("ready", () => {
    console.log("Redis connection ready");
  });

  connection.on("close", () => {
    console.warn("Redis connection closed");
  });

  connection.on("reconnecting", () => {
    console.log("Redis reconnecting...");
  });

  leadQueue = new Queue("leadQueue", {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });
} catch (error) {
  console.warn(
    "Redis/Queue initialization failed, running without queue:",
    error.message
  );
  leadQueue = null;
}

// Function to check and ensure queue connection
export const ensureQueueConnection = async () => {
  if (!leadQueue || !connection) {
    return false;
  }

  try {
    if (connection.status !== "ready") {
      await connection.connect();
    }
    return connection.status === "ready";
  } catch (error) {
    console.warn("Failed to ensure queue connection:", error.message);
    return false;
  }
};

export { leadQueue };
