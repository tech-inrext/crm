import { Controller } from '@framework';
import { userAuth } from '@/middlewares/auth';
import CabBookingExcelService from '@/be/services/analytics/cabExcel';
import fs from 'fs';

class CabBookingExcelController extends Controller {
  async get(req, res) {
    try {
      const { fromDate, toDate, year, month, format } = req.query;

      const { filePath, fileName, contentType } = await CabBookingExcelService.generateExcel({
        fromDate, toDate, year, month, format
      });

      // Stream the file
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on('end', () => console.log('[Cab Booking Excel] File sent successfully.'));
      fileStream.on('error', err => console.error('[Cab Booking Excel] Stream error:', err));
    } catch (err) {
      console.error('[Cab Booking Excel] Controller error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default (req, res) => userAuth(req, res, new CabBookingExcelController().handler);
