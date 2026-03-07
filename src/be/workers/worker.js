import dotenv from "dotenv";
dotenv.config();

import { worker } from './WorkerDT.js';
import bulkUploadLeads from "./bulkupload.js";
import sendOTPJob from "./sendOTPJob.js";
import sendNotificationEmail from "./sendNotificationEmail.js";
import notificationCleanupJob from "./notificationCleanup.js";
import sendLeadFollowUpNotification from "./sendLeadFollowUpNotification.js";
import bulkAssignLeads from "./bulkAssignLeads.js";
import revertBulkAssign from "./revertBulkAssign.js";
import checkFollowUpsJob from "./checkFollowUpsJob.js";


// Attach different workers here
// Todo: Mithu -> Auto register based on file
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

//Cron jobs
worker.addCron('checkFollowUps', 60000, 'checkFollowUps-cron');
worker.addCron('notificationCleanup', 60 * 60 * 1000, 'notificationCleanup-cron', {
  action: "expired"
});
worker.addCron('notificationCleanup', 24 * 60 * 60 * 1000, 'notificationCleanup-cron', {
  action: "all"
});



export default worker;
