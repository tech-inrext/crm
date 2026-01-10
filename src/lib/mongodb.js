// lib/dbConnect.js
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config(); // ✅ Load env variables right here

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Check if we have a cached connection that's still alive
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in connecting state, wait for the promise
  if (cached.promise && mongoose.connection.readyState === 2) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      // If the promise fails, reset it so we can try again
      cached.promise = null;
      cached.conn = null;
    }
  }

  // Reset connection if it's in a failed or disconnected state
  if (
    mongoose.connection.readyState === 0 ||
    mongoose.connection.readyState === 3
  ) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
      // Add retrying and reconnection options
      retryWrites: true,
      maxStalenessSeconds: 90,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");

        // Set up error handlers
        mongoose.connection.on("error", (error) => {
          console.error("MongoDB connection error:", error);
          // Don't reset cached connection immediately, let it retry
        });

        mongoose.connection.on("disconnected", () => {
          console.warn("MongoDB disconnected, will attempt to reconnect...");
          // Reset cached connection on disconnect
          cached.conn = null;
          cached.promise = null;
        });

        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        // Reset promise on error so next attempt can try again
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Database connection failed:", error);
    // Reset the promise so next attempt can try again
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export default dbConnect;
