import dotenv from "dotenv";
import path from "path";
import dbConnect from "../../lib/mongodb.js";
import weeklyPerformanceSummary from "../workers/weeklyPerformanceSummary.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const test = async () => {
  console.log("🚀 Manually triggering Weekly Performance Summary test...");
  try {
    await dbConnect();
    console.log("✅ Connected to Database");

    // Manually call the worker function
    await weeklyPerformanceSummary({ name: "ManualTestJob" });

    console.log("🏁 Test completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
};

test();
