import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Mimic commonjs __dirname if needed, though we use ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../.env") });

import dbConnect from "../../lib/mongodb.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";
import { calculateEmployeeStats, sendWeeklySummaryWhatsApp } from "../workers/weeklyPerformanceSummary.js";
import { sendWeeklySummaryEmail } from "../email-service/weekly-performance-summary/weeklyPerformanceEmail.js";

async function testSummaryMail() {
  console.log("🚀 Starting Weekly Summary Test Script...");

  try {
    await dbConnect();
    console.log("✅ DB Connected.");

    // GET TARGET FROM ARGUMENT OR FIND FIRST
    const identifier = process.argv[2];
    let employee;

    if (identifier) {
      console.log(`🔍 Searching for employee with identifier: ${identifier}...`);
      employee = await Employee.findOne({
        $or: [
          { email: identifier },
          { employeeProfileId: identifier },
          { _id: mongoose.isValidObjectId(identifier) ? identifier : null }
        ].filter(q => q._id !== null || q.email || q.employeeProfileId)
      });
    } else {
      console.log("ℹ️ No identifier provided. Finding first employee with an email...");
      employee = await Employee.findOne({ email: "rahulmithu5@gmail.com" });
    }

    if (!employee) {
      console.error("❌ No employee found with an email address.");
      process.exit(1);
    }

    console.log(`📦 Found Employee: ${employee.name} (${employee.email})`);

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate Dates for Subject line
    const format = (d) => {
      const day = d.getDate();
      const month = d.toLocaleString('en-IN', { month: 'long' });
      const suffix = (n) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };
      return `${day}${suffix(day)} ${month}`;
    };
    const dateRange = `${format(lastWeek)} to ${format(now)}`;

    console.log(`📊 Calculating stats since ${lastWeek.toISOString()}...`);
    const stats = await calculateEmployeeStats(employee, lastWeek);

    console.log("📧 Sending Summary Email...");
    await sendWeeklySummaryEmail(employee, stats, dateRange);

    console.log("📲 Sending Summary WhatsApp...");
    await sendWeeklySummaryWhatsApp(employee, stats, dateRange);

    console.log("✅ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testSummaryMail();
