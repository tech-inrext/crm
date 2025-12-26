import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Allow ?year=YYYY&month=MM for custom download, fallback to current month
    let { year, month } = req.query;
    const now = new Date();
    if (!year) year = now.getFullYear();
    if (!month) month = String(now.getMonth() + 1).padStart(2, '0');
    const fileName = `cab-booking-analytics-${year}-${month}.xlsx`;
    const filePath = path.join(process.cwd(), 'public', 'exports', fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Excel file not found for this month.' });
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
