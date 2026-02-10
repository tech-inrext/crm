import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/mongodb';
import CabBooking from '../../models/CabBooking';
import mongoose from 'mongoose';

class CabBookingExcelService {
  async generateExcel({ fromDate, toDate, year: yearParam, month: monthParam, format }) {
    await dbConnect();

    const now = new Date();
    let fileName, filePath, contentType;

    // Use local variables instead of reassigning parameters
    const year = yearParam || now.getFullYear();
    const month = monthParam || String(now.getMonth() + 1).padStart(2, '0');

    // Prepare filename
    if (fromDate || toDate) {
      const fromStr = fromDate ? new Date(fromDate).toISOString().split('T')[0] : 'all';
      const toStr = toDate ? new Date(toDate).toISOString().split('T')[0] : 'all';
      fileName = `cab-booking-analytics-${fromStr}-to-${toStr}.${format === 'xml' ? 'xml' : 'xlsx'}`;
    } else {
      fileName = `cab-booking-analytics-${year}-${month}.${format === 'xml' ? 'xml' : 'xlsx'}`;
    }

    filePath = path.join(process.cwd(), 'public', 'exports', fileName);
    contentType = format === 'xml'
      ? 'application/xml'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Build date filter if provided
    const dateFilter = {};
    if (fromDate || toDate) {
      dateFilter.requestedDateTime = {};
      if (fromDate) {
        const gte = new Date(fromDate);
        if (!isNaN(gte)) dateFilter.requestedDateTime.$gte = gte;
      }
      if (toDate) {
        const lte = new Date(toDate);
        if (!isNaN(lte)) dateFilter.requestedDateTime.$lte = lte;
      }
    }

    // Fetch bookings
    const bookings = await CabBooking.find(dateFilter)
      .populate('cabBookedBy', 'name email phone')
      .populate('managerId', 'name email')
      .populate('project', 'name')
      .populate('vehicle', 'model registrationNumber type')
      .populate('driver', 'name email phone')
      .lean();

    // Prepare Excel worksheet
    const wsData = [
      [
        'Project', 'Client Name', 'Pickup', 'Drop', 'Manager',
        'Travel Time', 'Cab Owner', 'Booked By', 'Driver Name',
        'Aadhar (Driver)', 'DL Number (Driver)', 'Fare', 'Vehicle',
        'Vehicle Number', 'Status', 'Notes'
      ],
      ...bookings.map(b => [
        (b.project && b.project.name) || '',
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
        b.notes || ''
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cab Bookings');

    // Ensure export directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    XLSX.writeFile(wb, filePath);

    return { filePath, fileName, contentType };
  }
}

export default new CabBookingExcelService();
