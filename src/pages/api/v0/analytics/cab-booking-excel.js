

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/mongodb';
import CabBooking from '@/models/CabBooking';
import Project from '@/models/Project';

export default async function handler(req, res) {
  try {
    console.log('[Cab Booking Analytics] Handler called with query:', req.query);
    // Support ?fromDate=ISO&toDate=ISO for date range, fallback to year/month if not provided
    let { fromDate, toDate, year, month, format } = req.query;
    const now = new Date();
    let fileName, filePath, contentType;
    // Use fromDate/toDate in filename if present
    if (fromDate || toDate) {
      const fromStr = fromDate ? new Date(fromDate).toISOString().split('T')[0] : 'all';
      const toStr = toDate ? new Date(toDate).toISOString().split('T')[0] : 'all';
      fileName = `cab-booking-analytics-${fromStr}-to-${toStr}.${format === 'xml' ? 'xml' : 'xlsx'}`;
    } else {
      if (!year) year = now.getFullYear();
      if (!month) month = String(now.getMonth() + 1).padStart(2, '0');
      fileName = `cab-booking-analytics-${year}-${month}.${format === 'xml' ? 'xml' : 'xlsx'}`;
    }
    filePath = path.join(process.cwd(), 'public', 'exports', fileName);
    contentType = format === 'xml'
      ? 'application/xml'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    // Debug log for file path
    console.log('[Cab Booking Analytics] Checking file path:', filePath);
    // Always generate Excel file on demand with all cab booking details
    try {
      await dbConnect();
      // Build date filter if fromDate/toDate provided
      let dateFilter = {};
      if (fromDate || toDate) {
        // Parse dates as UTC
        let gte, lte;
        if (fromDate) {
          gte = new Date(fromDate);
          if (isNaN(gte.getTime())) {
            return res.status(400).json({ error: 'Invalid fromDate' });
          }
        }
        if (toDate) {
          lte = new Date(toDate);
          if (isNaN(lte.getTime())) {
            return res.status(400).json({ error: 'Invalid toDate' });
          }
        }
        dateFilter.requestedDateTime = {};
        if (gte) dateFilter.requestedDateTime.$gte = gte;
        if (lte) dateFilter.requestedDateTime.$lte = lte;
      }
      // Fetch bookings with date filter if present
      let bookings = [];
      try {
        let query = CabBooking.find(dateFilter)
          .populate('cabBookedBy', 'name email phone')
          .populate('managerId', 'name email')
          .populate('project', 'name')
          .populate('vehicle', 'model registrationNumber type');
        try {
          query = query.populate('driver', 'name email phone');
        } catch (e) {
          console.warn('[Cab Booking Analytics] Driver population failed:', e);
        }
        bookings = await query.lean();
        console.log(`[Cab Booking Analytics] Bookings fetched: ${bookings.length}`);
        if (bookings.length > 0) {
          console.log('[Cab Booking Analytics] First booking sample:', JSON.stringify(bookings[0], null, 2));
        }
      } catch (err) {
        console.error('Booking population error:', err);
        throw new Error('Booking population error: ' + (err && err.message ? err.message : err));
      }

      // Prepare worksheet data
      const wsData = [
        [
          'Project',
          'Client Name',
          'Pickup',
          'Drop',
          'Manager',
          'Travel Time',
          'Cab Owner',
          'Booked By',
          'Driver Name',
          'Aadhar (Driver)',
          'DL Number (Driver)',
          'Fare',
          'Vehicle',
          'Vehicle Number',
          'Status',
          'Notes',
        ],
        ...bookings.map((b, i) => {
          const row = [
            (b.project && typeof b.project === 'object' && b.project.name) ? b.project.name : (typeof b.project === 'string' ? b.project : ''),
            b.clientName || '',
            b.pickupPoint || '',
            b.dropPoint || '',
            (b.managerId && b.managerId.name) || '',
            b.requestedDateTime ? new Date(b.requestedDateTime).toLocaleString('en-IN') : '',
            b.cabOwner || '',
            (b.cabBookedBy && b.cabBookedBy.name) || (b.cabBookedBy && b.cabBookedBy.email) || b.cabBookedBy || '',
            b.driverName || (b.driver && (b.driver.name || b.driver.email)) || '',
            b.aadharNumber || '',
            b.dlNumber || '',
            b.fare != null ? `₹ ${b.fare}` : '',
            (b.vehicle && b.vehicle.model) || '',
            (b.vehicle && b.vehicle.registrationNumber) || '',
            b.status || '',
            b.notes || '',
          ];
          if (i < 3) console.log(`[Cab Booking Analytics] Row ${i + 1}:`, row);
          return row;
        })
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cab Bookings');
      // Ensure exports directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      XLSX.writeFile(wb, filePath);
      console.log('[Cab Booking Analytics] Excel file generated at:', filePath);
    } catch (err) {
      console.error('[Cab Booking Analytics] Failed to generate Excel:', err);
      res.status(500).json({ error: 'Failed to generate Excel file.', details: err && err.message ? err.message : err });
      return;
    }
    // Now stream the file
    try {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on('end', () => {
        console.log('[Cab Booking Analytics] File stream ended successfully.');
      });
      fileStream.on('error', (err) => {
        console.error('[Cab Booking Analytics] File stream error:', err);
      });
    } catch (err) {
      console.error('[Cab Booking Analytics] Error streaming file:', err);
      res.status(500).json({ error: 'Failed to stream Excel file.', details: err && err.message ? err.message : err });
      return;
    }
  } catch (err) {
    // Log full error stack for debugging
    console.error('[Cab Booking Excel] Fatal Error:', err && err.stack ? err.stack : err);
    // Respond with error details for debugging (remove in production)
    res.status(500).json({
      error: 'Internal Server Error',
      message: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined
    });
  }
}
