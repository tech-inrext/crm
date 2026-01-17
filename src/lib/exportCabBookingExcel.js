import xlsx from 'xlsx';
import fs from 'fs';

export async function exportCabBookingAnalyticsToExcel(bookings, filePath) {
  const data = bookings.map(b => ({
    BookingID: b._id,
    Vendor: b.vendor,
    Fare: b.fare,
    Status: b.status,
    CreatedAt: b.createdAt,
    UpdatedAt: b.updatedAt,
    ...b // Add more fields as needed
  }));
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'CabBookings');
  xlsx.writeFile(wb, filePath);
}
