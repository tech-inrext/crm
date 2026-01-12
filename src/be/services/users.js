import Employee from "@/models/Employee";
import Lead from "@/models/Lead";
import { getCabBooking } from "@/be/services/analytics/cabBooking";
import mongoose from "mongoose";

const activeLeadStatuses = [
  "followup",
  "follow up",
  "callback",
  "call back",
  "details shared",
  "site visit",
  "site visit done",
];

export async function getUsersWithStats(managerId) {
  // 1. Fetch all employees
  const allEmployees = await Employee.find({}, { _id: 1, name: 1, teamName: 1, managerId: 1, mouStatus: 1 }).lean();

  // 2. Build maps
  const empMap = new Map();
  const managerToChildren = new Map();
  for (const emp of allEmployees) {
    const id = emp._id.toString();
    empMap.set(id, emp);
    const mgrId = emp.managerId ? emp.managerId.toString() : null;
    if (mgrId) {
      if (!managerToChildren.has(mgrId)) managerToChildren.set(mgrId, []);
      managerToChildren.get(mgrId).push(emp);
    }
  }

  // 3. Get users under managerId
  let users = [];
  if (managerId && managerId !== 'all') {
    users = managerToChildren.get(managerId.toString()) || [];
  } else {
    users = allEmployees;
  }

  // 4. Fetch all leads
  const allLeads = await Lead.find({}, { assignedTo: 1, uploadedBy: 1, status: 1 }).lean();

  // 5. Precompute lead stats
  const userLeadStats = {};
  for (const emp of allEmployees) {
    const id = emp._id.toString();
    userLeadStats[id] = { newLeads: 0, activeLeads: 0, siteVisitCount: 0 };
  }
  for (const lead of allLeads) {
    const assignedId = lead.assignedTo?.toString?.();
    const uploadedId = lead.uploadedBy?.toString?.();
    const status = lead.status?.toLowerCase?.() || "";
    const ids = new Set();
    if (assignedId) ids.add(assignedId);
    if (uploadedId) ids.add(uploadedId);
    for (const id of ids) {
      if (!userLeadStats[id]) continue;
      if (/^new$/i.test(status)) userLeadStats[id].newLeads++;
      if (activeLeadStatuses.some(s => s.toLowerCase() === status)) userLeadStats[id].activeLeads++;
      if (/site visit/i.test(status)) userLeadStats[id].siteVisitCount++;
    }
  }

  // 6. Precompute MoU stats
  const userMouStats = {};
  for (const emp of allEmployees) {
    userMouStats[emp._id.toString()] = { pending: 0, approved: 0, completed: 0 };
  }
  for (const emp of allEmployees) {
    const mgrId = emp.managerId ? emp.managerId.toString() : null;
    if (!mgrId) continue;
    const status = emp.mouStatus?.toLowerCase?.() || "";
    if (!userMouStats[mgrId]) continue;
    if (status === "pending") userMouStats[mgrId].pending++;
    if (status === "approved") userMouStats[mgrId].approved++;
    if (status === "completed") userMouStats[mgrId].completed++;
  }

  // 7. Precompute cab booking analytics
  const cabBookingCache = {};
  async function getCabBookingCached(userId) {
    if (cabBookingCache[userId]) return cabBookingCache[userId];
    const res = await getCabBooking({ avpId: new mongoose.Types.ObjectId(userId) });
    cabBookingCache[userId] = res || { totalVendors: 0, totalSpend: 0 };
    return cabBookingCache[userId];
  }

  // 8. Build user tree
  const MAX_DEPTH = 3;
  async function buildUserTree(user, depth = 0) {
    const userId = user._id.toString();
    const children = (depth < MAX_DEPTH && managerToChildren.get(userId)) ? await Promise.all(managerToChildren.get(userId).map(child => buildUserTree(child, depth + 1))) : [];
    const leadStats = userLeadStats[userId] || { newLeads: 0, activeLeads: 0, siteVisitCount: 0 };
    const mouStats = userMouStats[userId] || { pending: 0, approved: 0, completed: 0 };
    const cabBookingAnalytics = await getCabBookingCached(userId);
    return {
      ...user,
      newLeads: leadStats.newLeads,
      activeLeads: leadStats.activeLeads,
      siteVisitCount: leadStats.siteVisitCount,
      mouStats,
      totalVendors: cabBookingAnalytics.totalVendors ?? 0,
      totalSpend: cabBookingAnalytics.totalSpend ?? 0,
      children,
    };
  }
  const userStats = await Promise.all(users.map(user => buildUserTree(user)));

  // Helper to recursively sum stats
  function sumStats(usersArr, seen = new Set()) {
    function addStats(a, b) {
      return {
        newLeads: a.newLeads + b.newLeads,
        activeLeads: a.activeLeads + b.activeLeads,
        siteVisitCount: a.siteVisitCount + b.siteVisitCount,
        mou: {
          pending: a.mou.pending + b.mou.pending,
          approved: a.mou.approved + b.mou.approved,
          completed: a.mou.completed + b.mou.completed,
        },
        totalVendors: a.totalVendors + b.totalVendors,
        totalSpend: a.totalSpend + b.totalSpend,
      };
    }
    let stats = {
      newLeads: 0,
      activeLeads: 0,
      siteVisitCount: 0,
      mou: { pending: 0, approved: 0, completed: 0 },
      totalVendors: 0,
      totalSpend: 0
    };
    for (const user of usersArr) {
      const userId = typeof user._id === 'string' ? user._id : user._id.toString();
      if (seen.has(userId)) continue;
      seen.add(userId);
      let userStats = {
        newLeads: user.newLeads || 0,
        activeLeads: user.activeLeads || 0,
        siteVisitCount: user.siteVisitCount || 0,
        mou: {
          pending: user.mouStats?.pending || 0,
          approved: user.mouStats?.approved || 0,
          completed: user.mouStats?.completed || 0,
        },
        totalVendors: user.totalVendors || 0,
        totalSpend: user.totalSpend || 0
      };
      if (user.children && user.children.length > 0) {
        userStats = addStats(userStats, sumStats(user.children, seen));
      }
      stats = addStats(stats, userStats);
    }
    return stats;
  }
  const initialStats = sumStats(userStats);

  // Combined MoU stats for all users in userStats (top-level only)
  const mous = userStats.reduce((acc, user) => {
    acc.pending += user.mouStats.pending || 0;
    acc.approved += user.mouStats.approved || 0;
    acc.completed += user.mouStats.completed || 0;
    return acc;
  }, { pending: 0, approved: 0, completed: 0 });

  // Remove duplicate users by _id for dropdown (flat list)
  const uniqueUsersMap = new Map();
  function collectUniqueUsers(usersArr) {
    for (const user of usersArr) {
      const userId = typeof user._id === 'string' ? user._id : user._id.toString();
      if (!uniqueUsersMap.has(userId)) {
        uniqueUsersMap.set(userId, user);
      }
      if (user.children && user.children.length > 0) {
        collectUniqueUsers(user.children);
      }
    }
  }
  collectUniqueUsers(userStats);
  const uniqueUsers = Array.from(uniqueUsersMap.values());

  return { users: uniqueUsers, mous, initialStats };
}
