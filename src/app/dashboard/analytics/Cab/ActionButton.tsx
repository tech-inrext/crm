"use client";
import React from "react";
const cabbookingRequests: Map<string, Promise<any>> = new Map();
const [loading, setLoading] = React.useState(false);
const [avpUsers, setAvpUsers] = React.useState([]);
const [vendorData, setVendorData] = React.useState(null);
const [selectedVendor, setSelectedVendor] = React.useState("");
const handleResetFilters = () => {
  const resetFilters = { status: "all", month: "all", year: "all", avp: "all" };
  setTempFilters(resetFilters);
  setAppliedFilters(resetFilters);
  setSelectedVendor("");
  fetchVendors(resetFilters);
};
const [tempFilters, setTempFilters] = React.useState({
  status: "all",
  month: "all",
  year: "all",
  avp: "all",
});
const fetchVendors = async (filters = appliedFilters) => {
  setLoading(true);
  try {
    // Build API URL with filters (use combined cab analytics endpoint)
    let url = "/api/v0/analytics/cabbooking";
    const params = new URLSearchParams();

    // Add month and year filters
    if (filters.month !== "all" || filters.year !== "all") {
      const monthValue = filters.month !== "all" ? filters.month : "01";
      const yearValue =
        filters.year !== "all"
          ? filters.year
          : new Date().getFullYear().toString();
      params.append("month", `${yearValue}-${monthValue}`);
    }

    // Add status filter
    if (filters.status !== "all") {
      params.append("status", filters.status);
    }

    // Add AVP filter
    if (filters.avp !== "all") {
      if (filters.avp.startsWith("manual_avp_")) {
        const selectedAvp = avpUsers.find((avp) => avp._id === filters.avp);
        if (selectedAvp) {
          params.append("avpName", selectedAvp.name);
        }
      } else {
        params.append("avpId", filters.avp);
      }
    }

    if (params.toString()) {
      url += "?" + params.toString();
    }

    // Coalesce identical requests: if same URL is already being fetched, await that promise
    const key = url;
    let data;
    if (cabbookingRequests.has(key)) {
      data = await cabbookingRequests.get(key);
    } else {
      const p = fetch(url)
        .then((r) => r.json())
        .finally(() => cabbookingRequests.delete(key));
      cabbookingRequests.set(key, p);
      data = await p;
    }

    if (data.success) {
      // If server returned AVP users, set them (so we don't call employee/role endpoints separately)
      if (
        data.avpUsers &&
        Array.isArray(data.avpUsers) &&
        data.avpUsers.length > 0
      ) {
        setAvpUsers(data.avpUsers);
      }
      // Filter out vendors with no bookings if month filter is applied
      let filteredVendors = data.allVendors;

      if (filters.month !== "all") {
        // Only show vendors that have bookings in the selected month
        filteredVendors = data.allVendors.filter(
          (vendor) => (vendor.totalBookings || 0) > 0
        );
      }

      setVendorData({
        ...data,
        allVendors: filteredVendors,
        totalVendors: filteredVendors.length,
      });
    } else {
      console.error("API returned error:", data.message || "Unknown error");
      setVendorData(null);
    }
  } catch (e) {
    console.error("Error fetching vendors:", e);
    setVendorData(null);
  } finally {
    setLoading(false);
  }
};
const handleSubmitFilters = () => {
  setAppliedFilters({ ...tempFilters });
  fetchVendors(tempFilters);
};
const [appliedFilters, setAppliedFilters] = React.useState({
  status: "all",
  month: "all",
  year: "all",
  avp: "all",
});
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "end",
    justifyContent: "flex-start",
  }}
>
  <label
    style={{
      display: "block",
      marginBottom: 6,
      fontWeight: 600,
      color: "#333",
      fontSize: "0.9rem",
      opacity: 0,
    }}
  >
    Actions:
  </label>
  <div style={{ display: "flex", gap: 8, width: "100%", marginTop: -10 }}>
    <button
      onClick={handleSubmitFilters}
      disabled={loading}
      style={{
        flex: 1,
        padding: "8px 16px",
        borderRadius: 6,
        border: "none",
        background: loading ? "#6c757d" : "#007bff",
        color: "#fff",
        fontSize: "0.9rem",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: 600,
      }}
    >
      {loading ? "Loading..." : "Apply Filters"}
    </button>
    <button
      onClick={handleResetFilters}
      disabled={loading}
      style={{
        flex: 1,
        padding: "8px 16px",
        borderRadius: 6,
        border: "1px solid #dc3545",
        background: "#fff",
        color: "#dc3545",
        fontSize: "0.9rem",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: 600,
      }}
    >
      Reset
    </button>
  </div>
</div>;
