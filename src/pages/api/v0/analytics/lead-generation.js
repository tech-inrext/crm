import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { userAuth } from '@/middlewares/auth';

async function handler(req, res) {
  await dbConnect();
  try {
    const period = (req.query.period || 'month').toString();

    // Canonical converted statuses (normalized: lowercase, no hyphen differences)
    const CONVERTED_STATUSES = [
      'site visit done',
      'call back',
      'follow up',
      'details shared'
    ];

    // If the request came from an authenticated employee, scope to their uploads
    const loggedInUserId = req.employee?._id;

    const baseMatch = {};
    if (loggedInUserId) baseMatch.uploadedBy = loggedInUserId;

    if (period === 'week') {
      // Compute start of current week (Monday) and end (Sunday) in UTC
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(now);
      monday.setHours(0,0,0,0);
      monday.setDate(now.getDate() - diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23,59,59,999);

      console.log('[lead-generation week] Week range:', monday.toISOString(), 'to', sunday.toISOString());
      console.log('[lead-generation week] LoggedInUserId:', loggedInUserId);

      // Build match query with user scope
      const weekMatch = { createdAt: { $gte: monday, $lte: sunday } };
      if (loggedInUserId) {
        weekMatch.uploadedBy = loggedInUserId;
      }

      // Fetch all leads in week and process locally to ensure correct day grouping
      const allWeekLeads = await Lead.find(weekMatch).lean();
      console.log('[lead-generation week] Total leads in week:', allWeekLeads.length);

      // Filter for converted statuses locally
      const convertedLeads = allWeekLeads.filter(lead => {
        const statusNorm = (lead.status || '')
          .toLowerCase()
          .replace(/-/g, ' ')
          .trim();
        return CONVERTED_STATUSES.includes(statusNorm);
      });
      
      console.log('[lead-generation week] Converted leads count:', convertedLeads.length);
      convertedLeads.slice(0, 5).forEach((l, i) => {
        const dayNum = new Date(l.createdAt).getDay();
        const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayNum];
        console.log(`  Lead ${i}: status="${l.status}" -> "${(l.status || '').toLowerCase().replace(/-/g, ' ').trim()}", createdAt=${l.createdAt.toISOString()}, day=${dayName}`);
      });

      // Group by day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
      const countsByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      convertedLeads.forEach(lead => {
        const dayOfWeek = new Date(lead.createdAt).getDay();
        countsByDay[dayOfWeek]++;
      });

      console.log('[lead-generation week] Counts by day (0=Sun, 1=Mon, ..., 6=Sat):', countsByDay);

      // Map to labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun
      // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const data = [countsByDay[1], countsByDay[2], countsByDay[3], countsByDay[4], countsByDay[5], countsByDay[6], countsByDay[0]];

      console.log('[lead-generation week] Final data:', data, 'labels:', labels);
      return res.status(200).json({ success: true, labels, data });
    }

    // Default: month period — return last 6 months (including current month)
    const now = new Date();
    const monthsToReturn = 6;
    const startMonth = new Date(now.getFullYear(), now.getMonth() - (monthsToReturn - 1), 1);
    startMonth.setHours(0,0,0,0);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endMonth.setHours(23,59,59,999);

    const pipeline = [
      { $match: { ...baseMatch, createdAt: { $gte: startMonth, $lte: endMonth } } },
      { $project: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        statusNorm: {
          $trim: {
            input: { $toLower: { $replaceAll: { input: { $ifNull: ['$status', ''] }, find: '-', replacement: ' ' } } }
          }
        }
      } },
      { $match: { statusNorm: { $in: CONVERTED_STATUSES } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    const results = await Lead.aggregate(pipeline);

    // Build label array and data array for last N months
    const labels = [];
    const data = [];
    const months = [];
    for (let i = monthsToReturn - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('en-US', { month: 'short' }) });
    }

    // Create a map from results
    const map = {};
    results.forEach(r => { map[`${r._id.year}-${r._id.month}`] = r.count; });

    months.forEach(m => {
      labels.push(m.label);
      data.push(map[`${m.year}-${m.month}`] || 0);
    });

    return res.status(200).json({ success: true, labels, data });

  } catch (err) {
    console.error('lead-generation error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
