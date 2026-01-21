<<<<<<< HEAD
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Allow ?year=YYYY&month=MM for custom download, fallback to current month
    let { year, month, format } = req.query;
    const now = new Date();
    if (!year) year = now.getFullYear();
    if (!month) month = String(now.getMonth() + 1).padStart(2, '0');
    let fileName, filePath, contentType;
    if (format === 'xml') {
      fileName = `cab-booking-analytics-${year}-${month}.xml`;
      filePath = path.join(process.cwd(), 'public', 'exports', fileName);
      contentType = 'application/xml';
    } else {
      fileName = `cab-booking-analytics-${year}-${month}.xlsx`;
      filePath = path.join(process.cwd(), 'public', 'exports', fileName);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    // Debug log for file path
    console.log('[Cab Booking Analytics] Checking file path:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('[Cab Booking Analytics] File not found:', filePath);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`${format === 'xml' ? 'XML' : 'Excel'} file not found for this month.`);
      return;
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('[Cab Booking Excel] Error:', err);
    res.status(500).json({ error: err.message });
  }
}
=======
import { Controller } from '@framework';
import { userAuth } from '@/middlewares/auth';
import CabBookingExcelService from '@/be/services/analytics/cabExcel';
import fs from 'fs';

class CabBookingExcelController extends Controller {
  async get(req, res) {
    const { fromDate, toDate, year, month, format } = req.query;

    // Call service to generate Excel
    const { filePath, fileName, contentType } = await CabBookingExcelService.generateExcel({
      fromDate,
      toDate,
      year,
      month,
      format
    });

    // Stream the file to client
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on("end", () => console.log("[Cab Booking Excel] File sent successfully."));
    fileStream.on("error", (err) => console.error("[Cab Booking Excel] Stream error:", err));
  }
}

// Wrap with authentication middleware
export default (req, res) => userAuth(req, res, new CabBookingExcelController().handler);
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
