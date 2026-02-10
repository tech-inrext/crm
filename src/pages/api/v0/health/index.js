import { Controller } from "@framework";
import dbConnect from "../../../../lib/mongodb.js";
import { leadQueue } from "../../../../be/queue/leadQueue.js";

class HealthController extends Controller {
  constructor() {
    super();
    // Skip auth for health check
    this.skipAuth = ["get"];
  }

  async get(req, res) {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Check MongoDB
    try {
      await Promise.race([
        dbConnect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB timeout")), 5000)
        ),
      ]);
      health.services.mongodb = "connected";
    } catch (error) {
      health.services.mongodb = `error: ${error.message}`;
      health.status = "partial";
    }

    // Check Redis/Queue
    try {
      if (leadQueue) {
        await Promise.race([
          leadQueue.add(
            "health-check",
            { timestamp: Date.now() },
            {
              removeOnComplete: 1,
              removeOnFail: 1,
            }
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Queue timeout")), 3000)
          ),
        ]);
        health.redis = "connected";
      } else {
        health.redis = "unavailable";
        health.status = "partial";
      }
    } catch (error) {
      health.services.redis = `error: ${error.message}`;
      health.status = "partial";
    }

    // Set status code based on health
    const statusCode = health.status === "ok" ? 200 : 503;

    res.status(statusCode).json({
      success: health.status === "ok",
      data: health,
    });
  }
}

export default new HealthController().handler;
