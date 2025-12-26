

import { getLeadGeneration } from "./analytics/leadGeneration";
import { getSchedule } from "./analytics/schedule";
import { getCabBooking } from "./analytics/cabBooking";
import { getLeads } from "./analytics/leads";
import { getOverall } from "./analytics/overall";
import { getVendor } from "./analytics/vendor";

export const AnalyticsService = {
  getLeadGeneration,
  getSchedule,
  getCabBooking,
  getLeads,
  getOverall,
  getVendor,
};
