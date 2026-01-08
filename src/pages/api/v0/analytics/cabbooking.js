
import { AnalyticsService } from "@/be/services/Analytics";

export default async function handler(req, res) {
  try {
    const { vendorNames, vendorEmails, month, status, avpId, avpName } = req.query;
    const result = await AnalyticsService.getCabBooking({ vendorNames, vendorEmails, month, status, avpId, avpName });
    res.status(200).json(result);
  } catch (err) {
    console.error("CabBooking analytics error:", err);
    res.status(500).json({ error: err.message });
  }
}
