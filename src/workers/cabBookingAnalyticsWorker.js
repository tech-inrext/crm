import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import fs from 'fs';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { exportCabBookingAnalyticsToExcel } from '../lib/exportCabBookingExcel.js';
import CabBooking from '../models/CabBooking.js';
import Employee from '../models/Employee.js';
import dbConnect from '../lib/mongodb.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const cabBookingQueue = new Queue('cabBookingAnalytics', { connection });


async function resetVendorBillingAndCabBooking() {
  await dbConnect();
  // Reset vendor earnings
  await Employee.updateMany(
    { isCabVendor: true },
    { $set: { totalEarnings: 0 } }
  );
  // Reset all cab booking analytics (set fare and status fields to 0/empty for new month)
  await CabBooking.updateMany({}, { $set: { fare: 0, status: 'reset' } });
  // Optionally, remove all bookings for a true reset:
  // await CabBooking.deleteMany({});
  console.log('Vendor billing and cab booking analytics reset to 0 for new month');
}

async function generateMonthlyCabBookingExcel() {
  await dbConnect();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const bookings = await CabBooking.find({
    createdAt: { $gte: monthStart, $lte: monthEnd },
  }).lean();
  const filePath = path.join(
    __dirname,
    `../../exports/cab-booking-analytics-${format(monthStart, 'yyyy-MM')}.xlsx`
  );
  await exportCabBookingAnalyticsToExcel(bookings, filePath);
  console.log('Cab booking analytics Excel generated:', filePath);
}


const worker = new Worker(
  'cabBookingAnalytics',
  async (job) => {
    if (job.name === 'resetVendorBilling') {
      await resetVendorBillingAndCabBooking();
    } else if (job.name === 'generateMonthlyExcel') {
      await generateMonthlyCabBookingExcel();
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.name} completed (ID: ${job.id})`);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job.name} failed (ID: ${job.id}):`, err);
});

// Schedule jobs at month end and start

function scheduleMonthlyJobs() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 5); // 5s after midnight
  const msToNextMonth = nextMonth - now;
  setTimeout(async () => {
    await cabBookingQueue.add('generateMonthlyExcel', {});
    await cabBookingQueue.add('resetVendorBilling', {});
    scheduleMonthlyJobs(); // Schedule again for next month
  }, msToNextMonth);
}
scheduleMonthlyJobs();

export default worker;
