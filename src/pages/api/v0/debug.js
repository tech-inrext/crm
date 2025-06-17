// Debug endpoint to help troubleshoot 500 errors in Vercel
import dbConnect from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    console.log("=== DEBUG ENDPOINT ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Request method:", req.method);
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));

    // Test database connection
    try {
      await dbConnect();
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: dbError.message,
        details:
          process.env.NODE_ENV === "development" ? dbError.stack : undefined,
      });
    }

    // Test environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT SET",
      SMTP_EMAIL: process.env.SMTP_EMAIL ? "SET" : "NOT SET",
      SMTP_PASS: process.env.SMTP_PASS ? "SET" : "NOT SET",
    };

    console.log("Environment variables:", envVars);

    // Test package imports
    let packageTests = {};
    try {
      const bcrypt = require("bcrypt");
      packageTests.bcrypt = "✅ OK";
    } catch (err) {
      packageTests.bcrypt = "❌ FAILED: " + err.message;
    }

    try {
      const jwt = require("jsonwebtoken");
      packageTests.jwt = "✅ OK";
    } catch (err) {
      packageTests.jwt = "❌ FAILED: " + err.message;
    }

    try {
      const cookie = require("cookie");
      packageTests.cookie = "✅ OK";
    } catch (err) {
      packageTests.cookie = "❌ FAILED: " + err.message;
    }

    try {
      const mongoose = require("mongoose");
      packageTests.mongoose = "✅ OK";
    } catch (err) {
      packageTests.mongoose = "❌ FAILED: " + err.message;
    }

    console.log("Package tests:", packageTests);

    res.status(200).json({
      success: true,
      message: "Debug endpoint working",
      environment: envVars,
      packages: packageTests,
      timestamp: new Date().toISOString(),
      platform: {
        nodejs: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    });
  } catch (error) {
    console.error("=== DEBUG ENDPOINT ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Debug endpoint failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
