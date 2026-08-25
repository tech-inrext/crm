"use client";

import React, { useState } from "react";
import {
  Group,
  Search,
  DirectionsCar,
  Person,
  GridView,
  TableRows,
  FilterAlt,
  Close,
} from "@mui/icons-material";

export interface TeamBookingItem {
  _id: string;
  bookingId: string;
  employeeName: string;
  employeeEmail?: string;
  employeeProfileId?: string;
  project: string;
  clientName: string;
  pickupPoint: string;
  dropPoint: string;
  requestedDateTime: string;
  status: string;
  vendorName?: string;
  driverName?: string;
  fare?: number;
  createdAt?: string;
}

export interface TeamMemberItem {
  _id: string;
  name: string;
  email?: string;
  employeeProfileId?: string;
}

export interface TeamStats {
  totalTeamBookings: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  activeMembersCount: number;
  totalTeamMembers: number;
  teamMembers?: TeamMemberItem[];
  statusBreakdown?: {
    pending?: number;
    approved?: number;
    active?: number;
    completed?: number;
    cancelled?: number;
    rejected?: number;
  };
}

interface TeamBookingDetailsProps {
  stats?: TeamStats;
  bookings?: TeamBookingItem[];
}

const statusBadgeStyles: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "Pending", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  approved: { label: "Approved", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  active: { label: "Active / On Way", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  completed: { label: "Completed", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  rejected: { label: "Rejected", bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-red-500" },
};

const TeamBookingDetails: React.FC<TeamBookingDetailsProps> = ({ stats, bookings = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMemberKey, setSelectedMemberKey] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "members">("table");

  // 1. Build master list of unique team members (combining stats.teamMembers and actual booking creators)
  const memberMap: Record<string, { key: string; name: string; email: string; profileId: string; count: number }> = {};

  // Add members from stats if available
  if (stats?.teamMembers && Array.isArray(stats.teamMembers)) {
    stats.teamMembers.forEach((m) => {
      const key = m.email || m.name;
      if (key && !memberMap[key]) {
        memberMap[key] = {
          key,
          name: m.name,
          email: m.email || "",
          profileId: m.employeeProfileId || "",
          count: 0,
        };
      }
    });
  }

  // Add members from bookings
  bookings.forEach((b) => {
    const key = b.employeeEmail || b.employeeName;
    if (!memberMap[key]) {
      memberMap[key] = {
        key,
        name: b.employeeName,
        email: b.employeeEmail || "",
        profileId: b.employeeProfileId || "",
        count: 1,
      };
    } else {
      memberMap[key].count++;
    }
  });

  const availableTeamMembers = Object.values(memberMap);

  // 2. Filter bookings by selected team member
  const memberFilteredBookings = bookings.filter((item) => {
    if (selectedMemberKey === "all") return true;
    const itemKey = item.employeeEmail || item.employeeName;
    return itemKey === selectedMemberKey;
  });

  // 3. Filter bookings further by status and search query
  const filteredBookings = memberFilteredBookings.filter((item) => {
    const statusMatch =
      selectedStatus === "all" ||
      item.status?.toLowerCase() === selectedStatus.toLowerCase();

    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      item.employeeName?.toLowerCase().includes(query) ||
      item.bookingId?.toLowerCase().includes(query) ||
      item.project?.toLowerCase().includes(query) ||
      item.clientName?.toLowerCase().includes(query) ||
      item.pickupPoint?.toLowerCase().includes(query) ||
      item.dropPoint?.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  });

  // 4. Calculate dynamic stats based on selected member filter
  const isMemberSelected = selectedMemberKey !== "all";

  const dynamicTotalBookings = isMemberSelected
    ? memberFilteredBookings.length
    : stats?.totalTeamBookings || bookings.length;

  const dynamicPending = isMemberSelected
    ? memberFilteredBookings.filter((b) =>
        ["pending", "approved", "active"].includes(b.status?.toLowerCase())
      ).length
    : stats?.pending || 0;

  const dynamicCompleted = isMemberSelected
    ? memberFilteredBookings.filter((b) =>
        ["completed", "payment_due"].includes(b.status?.toLowerCase())
      ).length
    : stats?.completed || 0;

  const dynamicSpent = isMemberSelected
    ? memberFilteredBookings
        .filter((b) => ["completed", "payment_due"].includes(b.status?.toLowerCase()))
        .reduce((sum, b) => sum + (b.fare || 0), 0)
    : stats?.totalSpent || 0;

  const dynamicActiveMembers = isMemberSelected
    ? memberFilteredBookings.length > 0
      ? 1
      : 0
    : stats?.activeMembersCount || availableTeamMembers.filter((m) => m.count > 0).length;

  // Selected member details
  const selectedMemberInfo = isMemberSelected ? memberMap[selectedMemberKey] : null;

  // Group bookings per team member for member summary view
  const memberGroupedMap: Record<
    string,
    { employeeName: string; email: string; profileId: string; bookings: TeamBookingItem[] }
  > = {};

  memberFilteredBookings.forEach((b) => {
    const key = b.employeeEmail || b.employeeName;
    if (!memberGroupedMap[key]) {
      memberGroupedMap[key] = {
        employeeName: b.employeeName,
        email: b.employeeEmail || "",
        profileId: b.employeeProfileId || "",
        bookings: [],
      };
    }
    memberGroupedMap[key].bookings.push(b);
  });

  const memberList = Object.values(memberGroupedMap);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mt-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Group className="text-xl" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-lg tracking-tight">Team Booking Details</h5>
            <p className="text-xs text-gray-500">
              Overview and detailed cab booking records of team members working under you
            </p>
          </div>
        </div>

        {/* View Toggle (Table vs Member Cards) */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TableRows className="text-sm" />
            Bookings List ({filteredBookings.length})
          </button>
          <button
            onClick={() => setViewMode("members")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "members"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <GridView className="text-sm" />
            Team Summary ({memberList.length})
          </button>
        </div>
      </div>

      {/* Team Key Metrics Row (Dynamic per selected user) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {isMemberSelected ? "User Bookings" : "Team Bookings"}
          </span>
          <div className="text-xl font-bold text-slate-800 mt-1">{dynamicTotalBookings}</div>
          <span className="text-[10px] text-gray-500 font-medium">
            {isMemberSelected ? `Total for ${selectedMemberInfo?.name}` : "Total requests made"}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
            {isMemberSelected ? "Selected User" : "Active Members"}
          </span>
          <div className="text-xl font-bold text-purple-800 mt-1">{dynamicActiveMembers}</div>
          <span className="text-[10px] text-purple-600 font-medium truncate">
            {isMemberSelected ? selectedMemberInfo?.name || "1 Member" : "Members with bookings"}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
            {isMemberSelected ? "User Pending" : "Team Pending"}
          </span>
          <div className="text-xl font-bold text-amber-800 mt-1">{dynamicPending}</div>
          <span className="text-[10px] text-amber-600 font-medium">Pending & active</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
            {isMemberSelected ? "User Completed" : "Team Completed"}
          </span>
          <div className="text-xl font-bold text-emerald-800 mt-1">{dynamicCompleted}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Completed trips</span>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
            {isMemberSelected ? "User Cab Spend" : "Team Cab Spend"}
          </span>
          <div className="text-xl font-bold text-blue-800 mt-1">₹{dynamicSpent.toLocaleString("en-IN")}</div>
          <span className="text-[10px] text-blue-600 font-medium">Total cab fare</span>
        </div>
      </div>

      {/* Controls Bar: Team Member Dropdown, Search & Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-4">
        {/* Left Side Controls: Dropdown & Status Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Team Member Dropdown Selector */}
          <div className="relative min-w-[240px]">
            <div className="absolute left-3 top-2.5 text-purple-600 pointer-events-none flex items-center gap-1 font-bold">
              <Person className="text-base" />
            </div>
            <select
              value={selectedMemberKey}
              onChange={(e) => setSelectedMemberKey(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-bold bg-purple-50/70 border border-purple-200 text-purple-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">👥 All Team Members ({availableTeamMembers.length})</option>
              {availableTeamMembers.map((m) => (
                <option key={m.key} value={m.key}>
                  👤 {m.name} {m.profileId ? `(${m.profileId})` : ""} - {m.count} {m.count === 1 ? "trip" : "trips"}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 text-purple-500 text-[10px] pointer-events-none font-bold">
              ▼
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Statuses" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "active", label: "Active" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Controls: Search Bar & Active Filter Indicator */}
        <div className="flex items-center gap-2">
          {isMemberSelected && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
              <FilterAlt className="text-xs" />
              <span className="truncate max-w-[140px]">User: {selectedMemberInfo?.name}</span>
              <button
                onClick={() => setSelectedMemberKey("all")}
                className="ml-1 hover:bg-purple-200 p-0.5 rounded-full text-purple-700"
                title="Reset team member filter"
              >
                <Close className="text-xs" />
              </button>
            </div>
          )}

          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search project, client, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Booking Info</th>
                <th className="py-3 px-4">Team Member</th>
                <th className="py-3 px-4">Project & Client</th>
                <th className="py-3 px-4">Route (Pickup → Drop)</th>
                <th className="py-3 px-4">Vendor / Driver</th>
                <th className="py-3 px-4">Fare</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((item) => {
                  const statusKey = item.status?.toLowerCase() || "pending";
                  const badge = statusBadgeStyles[statusKey] || statusBadgeStyles.pending;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Booking Info */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                          <DirectionsCar className="text-blue-500 text-sm" />
                          {item.bookingId}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {formatDateTime(item.requestedDateTime)}
                        </div>
                      </td>

                      {/* Team Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                            {item.employeeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-xs">{item.employeeName}</div>
                            {item.employeeProfileId && (
                              <div className="text-[10px] text-gray-400 font-mono">{item.employeeProfileId}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Project & Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">{item.project}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Person className="text-gray-400 text-[12px]" />
                          {item.clientName}
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="text-[11px] font-medium text-gray-800 truncate" title={item.pickupPoint}>
                          <span className="text-emerald-600 font-bold">From:</span> {item.pickupPoint}
                        </div>
                        <div className="text-[11px] font-medium text-gray-600 truncate mt-0.5" title={item.dropPoint}>
                          <span className="text-rose-600 font-bold">To:</span> {item.dropPoint}
                        </div>
                      </td>

                      {/* Vendor / Driver */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">{item.vendorName || "Unassigned"}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {item.driverName ? `Driver: ${item.driverName}` : "No driver assigned"}
                        </div>
                      </td>

                      {/* Fare */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 text-xs">
                          {item.fare ? `₹${item.fare.toLocaleString("en-IN")}` : "—"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <DirectionsCar className="text-gray-300 text-4xl" />
                      <p className="font-medium text-sm text-gray-500">
                        {isMemberSelected
                          ? `No cab bookings found for ${selectedMemberInfo?.name}`
                          : "No cab bookings match your filters"}
                      </p>
                      <p className="text-xs text-gray-400">Try adjusting your team member selection, search keyword, or status tab</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Team Member Summary Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberList.map((m, idx) => {
            const completedCount = m.bookings.filter((b) =>
              ["completed", "payment_due"].includes(b.status?.toLowerCase())
            ).length;

            const pendingCount = m.bookings.filter((b) =>
              ["pending", "approved", "active"].includes(b.status?.toLowerCase())
            ).length;

            const memberSpend = m.bookings.reduce((sum, b) => sum + (b.fare || 0), 0);

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {m.employeeName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h6 className="font-bold text-gray-900 text-sm">{m.employeeName}</h6>
                    <p className="text-xs text-gray-500">{m.email || m.profileId || "Team Member"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="p-2 bg-white rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                    <div className="text-sm font-extrabold text-gray-800">{m.bookings.length}</div>
                  </div>
                  <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Done</span>
                    <div className="text-sm font-extrabold text-emerald-700">{completedCount}</div>
                  </div>
                  <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-bold uppercase">Pending</span>
                    <div className="text-sm font-extrabold text-amber-700">{pendingCount}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200/80 text-xs">
                  <span className="text-gray-500 font-medium">Total Spend:</span>
                  <span className="font-extrabold text-blue-700">₹{memberSpend.toLocaleString("en-IN")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamBookingDetails;
