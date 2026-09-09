"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Group,
  Search,
  DirectionsCar,
  Person,
  GridView,
  TableRows,
  FilterAlt,
  Close,
  Check,
  KeyboardArrowDown,
  FileDownload,
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
  const [isExporting, setIsExporting] = useState(false);

  // Searchable dropdown state
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const memberSearchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setIsMemberDropdownOpen(false);
      }
    };
    if (isMemberDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMemberDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isMemberDropdownOpen) {
      setTimeout(() => {
        memberSearchInputRef.current?.focus();
      }, 50);
    }
  }, [isMemberDropdownOpen]);

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

  // Filter team members list in the dropdown by search query
  const filteredTeamMembers = availableTeamMembers.filter((m) => {
    const q = memberSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.profileId?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

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

  // Export current filtered bookings to Excel (.xlsx) sheet
  const handleExportExcel = async () => {
    if (filteredBookings.length === 0) return;
    try {
      setIsExporting(true);
      const XLSX = await import("xlsx");

      const excelRows = filteredBookings.map((b) => ({
        "Booking ID": b.bookingId || "—",
        "Employee Name": b.employeeName || "—",
        "Employee ID": b.employeeProfileId || "—",
        "Email": b.employeeEmail || "—",
        "Project": b.project || "—",
        "Client Name": b.clientName || "—",
        "Pickup Point": b.pickupPoint || "—",
        "Drop Point": b.dropPoint || "—",
        "Trip Date & Time": formatDateTime(b.requestedDateTime),
        "Status": b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "—",
        "Vendor": b.vendorName || "Unassigned",
        "Driver": b.driverName || "Unassigned",
        "Fare (₹)": b.fare != null ? b.fare : 0,
        "Created At": formatDateTime(b.createdAt),
      }));

      const ws = XLSX.utils.json_to_sheet(excelRows);

      // Auto-fit column widths
      ws["!cols"] = [
        { wch: 16 }, // Booking ID
        { wch: 22 }, // Employee Name
        { wch: 14 }, // Employee ID
        { wch: 26 }, // Email
        { wch: 20 }, // Project
        { wch: 20 }, // Client Name
        { wch: 26 }, // Pickup Point
        { wch: 26 }, // Drop Point
        { wch: 22 }, // Trip Date & Time
        { wch: 14 }, // Status
        { wch: 20 }, // Vendor
        { wch: 18 }, // Driver
        { wch: 12 }, // Fare
        { wch: 22 }, // Created At
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cab Bookings");

      const dateStr = new Date().toISOString().slice(0, 10);
      const memberSuffix = isMemberSelected
        ? `_${(selectedMemberInfo?.name || "Member").replace(/[^a-zA-Z0-9]/g, "_")}`
        : "";
      XLSX.writeFile(wb, `Cab_Bookings${memberSuffix}_${dateStr}.xlsx`);
    } catch (error) {
      console.error("Failed to export Excel report:", error);
    } finally {
      setIsExporting(false);
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

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Download Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting || filteredBookings.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download cab booking records in Excel (.xlsx) sheet"
          >
            <FileDownload style={{ fontSize: 16 }} />
            <span>{isExporting ? "Exporting..." : "Download Excel"}</span>
          </button>
        </div>
      </div>

      {/* Team Key Metrics Row (Dynamic per selected user) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {isMemberSelected ? "User Cab Bookings" : "All Cab Bookings"}
          </span>
          <div className="text-xl font-bold text-slate-800 mt-1">{dynamicTotalBookings}</div>
          <span className="text-[10px] text-gray-500 font-medium truncate block">
            {isMemberSelected ? `Total for ${selectedMemberInfo?.name}` : "Total requests made"}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
            {isMemberSelected ? "User Active/Pending" : "Active/Pending Cab Bookings"}
          </span>
          <div className="text-xl font-bold text-amber-800 mt-1">{dynamicPending}</div>
          <span className="text-[10px] text-amber-600 font-medium">Pending & active</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
            {isMemberSelected ? "User Completed" : "Completed Cab Bookings"}
          </span>
          <div className="text-xl font-bold text-emerald-800 mt-1">{dynamicCompleted}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Completed trips</span>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
            {isMemberSelected ? "User Cab Spend" : "Total Cab Spend"}
          </span>
          <div className="text-xl font-bold text-blue-800 mt-1">₹{dynamicSpent.toLocaleString("en-IN")}</div>
          <span className="text-[10px] text-blue-600 font-medium">Total cab fare</span>
        </div>
      </div>

      {/* Controls Bar: Team Member Dropdown, Search & Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-4">
        {/* Left Side Controls: Dropdown & Status Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Searchable Team Member Dropdown Selector */}
          <div ref={memberDropdownRef} className="relative min-w-[260px] sm:min-w-[280px]">
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMemberDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between pl-3 pr-3 py-2 text-xs font-bold bg-purple-50/80 hover:bg-purple-100/70 border border-purple-200 text-purple-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer shadow-2xs text-left"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <div className="w-5 h-5 rounded-md bg-purple-200 text-purple-800 flex items-center justify-center text-[10px] shrink-0">
                  {isMemberSelected ? (
                    <Person className="text-sm" />
                  ) : (
                    <Group className="text-sm" />
                  )}
                </div>
                <span className="truncate">
                  {isMemberSelected
                    ? `${selectedMemberInfo?.name || selectedMemberKey} ${selectedMemberInfo?.profileId ? `(${selectedMemberInfo.profileId})` : ""}`
                    : `All Team Members (${availableTeamMembers.length})`}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isMemberSelected && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMemberKey("all");
                    }}
                    className="hover:bg-purple-200 p-0.5 rounded text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
                    title="Reset to all team members"
                  >
                    <Close style={{ fontSize: 14 }} />
                  </span>
                )}
                <KeyboardArrowDown
                  className={`text-purple-600 transition-transform duration-200 ${
                    isMemberDropdownOpen ? "rotate-180" : ""
                  }`}
                  style={{ fontSize: 18 }}
                />
              </div>
            </button>

            {/* Dropdown Menu Popover */}
            {isMemberDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full min-w-[290px] sm:min-w-[320px] bg-white border border-purple-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150">
                {/* Search Input Box */}
                <div className="p-2.5 bg-purple-50/70 border-b border-purple-100 sticky top-0">
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-purple-500">
                      <Search style={{ fontSize: 16 }} />
                    </div>
                    <input
                      ref={memberSearchInputRef}
                      type="text"
                      placeholder="Search member by name, ID, email..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                    {memberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMemberSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                      >
                        <Close style={{ fontSize: 14 }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 py-1">
                  {/* All Team Members Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberKey("all");
                      setIsMemberDropdownOpen(false);
                      setMemberSearchQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-purple-50/70 transition-colors cursor-pointer ${
                      selectedMemberKey === "all" ? "bg-purple-50 font-bold text-purple-900" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        selectedMemberKey === "all" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"
                      }`}>
                        <Group style={{ fontSize: 16 }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">All Team Members</div>
                        <div className="text-[10px] text-gray-500">
                          {availableTeamMembers.length} {availableTeamMembers.length === 1 ? "member" : "members"} total
                        </div>
                      </div>
                    </div>
                    {selectedMemberKey === "all" && (
                      <Check className="text-purple-600" style={{ fontSize: 16 }} />
                    )}
                  </button>

                  {/* Filtered Team Members List */}
                  {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((m) => {
                      const isSelected = selectedMemberKey === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => {
                            setSelectedMemberKey(m.key);
                            setIsMemberDropdownOpen(false);
                            setMemberSearchQuery("");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-purple-50/70 transition-colors cursor-pointer ${
                            isSelected ? "bg-purple-50 font-bold text-purple-900" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 border ${
                              isSelected ? "bg-purple-600 text-white border-purple-600" : "bg-purple-100 text-purple-800 border-purple-200"
                            }`}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate text-gray-900 flex items-center gap-1.5">
                                <span className="truncate">{m.name}</span>
                                {m.profileId && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-gray-100 text-gray-600 font-mono shrink-0">
                                    {m.profileId}
                                  </span>
                                )}
                              </div>
                              {m.email && (
                                <div className="text-[10px] text-gray-400 truncate">{m.email}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              m.count > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {m.count} {m.count === 1 ? "trip" : "trips"}
                            </span>
                            {isSelected && (
                              <Check className="text-purple-600" style={{ fontSize: 16 }} />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-6 px-4 text-center text-gray-400">
                      <p className="text-xs font-medium">No team member matches &quot;{memberSearchQuery}&quot;</p>
                      <button
                        type="button"
                        onClick={() => setMemberSearchQuery("")}
                        className="mt-1.5 text-[11px] text-purple-600 hover:underline font-semibold cursor-pointer"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer info in dropdown */}
                <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 flex items-center justify-between">
                  <span>Showing {filteredTeamMembers.length} of {availableTeamMembers.length}</span>
                  {isMemberSelected && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMemberKey("all");
                        setIsMemberDropdownOpen(false);
                        setMemberSearchQuery("");
                      }}
                      className="text-purple-600 hover:underline font-semibold cursor-pointer"
                    >
                      Reset filter
                    </button>
                  )}
                </div>
              </div>
            )}
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

          <div className="relative min-w-[240px] sm:min-w-[280px] flex-1 sm:flex-initial flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-gray-400">
              <Search style={{ fontSize: 18 }} />
            </div>
            <input
              type="text"
              placeholder="Search project, client, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50/80 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center"
                title="Clear search"
              >
                <Close style={{ fontSize: 14 }} />
              </button>
            )}
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
