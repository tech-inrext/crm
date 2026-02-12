"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";
import Paper from "@/components/ui/Component/Paper";
import { VendorFilterControls } from "./VendorFilterControls";
import { VendorDropdown } from "./VendorDropdown";
import { VendorStatsCards } from "./VendorStatsCards";
import { VendorCardsGrid } from "./VendorCardsGrid";
import { VendorLoading } from "./VendorLoading";
import { VendorEmpty } from "./VendorEmpty";

/* ---------------- Request Cache ---------------- */
const cabbookingRequests = new Map();

export function VendorBreakdown() {
  const [selectedVendor, setSelectedVendor] = React.useState("");
  const [vendorData, setVendorData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  /* ---------------- Filter States ---------------- */
  const [tempFilters, setTempFilters] = React.useState({
    status: "all",
    fromDate: null,
    toDate: null,
    avp: "all",
  });

  const [appliedFilters, setAppliedFilters] = React.useState({
    status: "all",
    fromDate: null,
    toDate: null,
    avp: "all",
  });

  /* ---------------- AVP Users ---------------- */
  const [avpUsers, setAvpUsers] = React.useState([]);
  const [avpLoading, setAvpLoading] = React.useState(false);
  const [avpError, setAvpError] = React.useState(null);

  /* ---------------- Fetch AVP Users ---------------- */
  const fetchAvpUsers = React.useCallback(async () => {
    setAvpLoading(true);
    setAvpError(null);

    try {
      const res = await fetch("/api/v0/employee/getAllEmployeeList?role=AVP");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setAvpUsers(data.data);
      } else {
        setAvpUsers([]);
        setAvpError("Failed to fetch AVP users");
      }
    } catch (err) {
      setAvpUsers([]);
      setAvpError("Failed to fetch AVP users");
    } finally {
      setAvpLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAvpUsers();
  }, [fetchAvpUsers]);

  /* ---------------- Fetch Vendors ---------------- */
  const mountRef = React.useRef(false);

  const fetchVendors = async (filters = appliedFilters) => {
    setLoading(true);

    try {
      let url = "/api/v0/analytics/cabbooking";
      const params = new URLSearchParams();

      if (filters.fromDate)
        params.append("fromDate", new Date(filters.fromDate).toISOString());

      if (filters.toDate)
        params.append("toDate", new Date(filters.toDate).toISOString());

      if (filters.status !== "all") params.append("status", filters.status);

      /* ---------- AVP Filter ---------- */
      if (filters.avp !== "all") {
        if (filters.avp.startsWith("manual_avp_")) {
          const realId = filters.avp.replace("manual_avp_", "");
          const selectedAvp = avpUsers.find(
            (a) => String(a._id) === String(realId),
          );

          if (selectedAvp) {
            params.append("avpName", selectedAvp.name);
          }
        } else {
          params.append("avpId", filters.avp);
        }
      }

      if (params.toString()) url += `?${params.toString()}`;

      /* ---------- Request Coalescing ---------- */
      let data;
      if (cabbookingRequests.has(url)) {
        data = await cabbookingRequests.get(url);
      } else {
        const p = fetch(url)
          .then((r) => r.json())
          .finally(() => cabbookingRequests.delete(url));

        cabbookingRequests.set(url, p);
        data = await p;
      }

      if (data.success) {
        setVendorData({
          ...data,
          allVendors: data.allVendors || [],
          totalVendors: data.allVendors?.length || 0,
        });
      } else {
        setVendorData(null);
      }
    } catch (err) {
      setVendorData(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Submit Filters ---------------- */
  const handleSubmitFilters = () => {
    setAppliedFilters({ ...tempFilters });
    fetchVendors(tempFilters);
  };

  /* ---------------- Reset Filters ---------------- */
  const handleResetFilters = () => {
    const reset = {
      status: "all",
      fromDate: null,
      toDate: null,
      avp: "all",
    };

    setTempFilters(reset);
    setAppliedFilters(reset);
    setSelectedVendor("");
    fetchVendors(reset);
  };

  /* ---------------- Initial Fetch ---------------- */
  React.useEffect(() => {
    if (mountRef.current) return;
    mountRef.current = true;
    fetchVendors();
  }, []);

  const allVendors = vendorData?.allVendors || [];

  /* ---------------- Vendor Display Filters ---------------- */
  let displayVendors = [...allVendors];

  if (appliedFilters.status === "completed") {
    displayVendors = displayVendors.filter(
      (v) => (v.completedBookings || 0) > 0,
    );
  }

  if (appliedFilters.status === "pending") {
    displayVendors = displayVendors.filter((v) => (v.pendingBookings || 0) > 0);
  }

  if (appliedFilters.status === "payment_due") {
    displayVendors = displayVendors.filter((v) => Number(v.paymentDue) > 0);
  }

  /* ---------- Safe AVP Filter ---------- */
  if (appliedFilters.avp !== "all") {
    displayVendors = displayVendors.filter(
      (vendor) => String(vendor.managerId) === String(appliedFilters.avp),
    );
  }

  if (selectedVendor) {
    displayVendors = displayVendors.filter((v) => v.name === selectedVendor);
  }

  /* ---------------- Detect Unapplied Changes ---------------- */
  const hasUnappliedChanges = React.useMemo(() => {
    return (
      tempFilters.status !== appliedFilters.status ||
      tempFilters.fromDate !== appliedFilters.fromDate ||
      tempFilters.toDate !== appliedFilters.toDate ||
      tempFilters.avp !== appliedFilters.avp
    );
  }, [tempFilters, appliedFilters]);

  return (
    <Box>
      <VendorFilterControls
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        appliedFilters={appliedFilters}
        avpUsers={avpUsers}
        avpLoading={avpLoading}
        avpError={avpError}
        handleSubmitFilters={handleSubmitFilters}
        handleResetFilters={handleResetFilters}
        hasUnappliedChanges={hasUnappliedChanges}
      />

      <VendorDropdown
        vendorData={vendorData}
        allVendors={allVendors}
        appliedFilters={appliedFilters}
        selectedVendor={selectedVendor}
        setSelectedVendor={setSelectedVendor}
      />

      {/* -------- Excel Download -------- */}
      <div style={{ marginTop: 16 }}>
        <a
          href={(() => {
            const from = appliedFilters.fromDate
              ? new Date(appliedFilters.fromDate).toISOString()
              : "";
            const to = appliedFilters.toDate
              ? new Date(appliedFilters.toDate).toISOString()
              : "";

            const params = [];
            if (from) params.push(`fromDate=${encodeURIComponent(from)}`);
            if (to) params.push(`toDate=${encodeURIComponent(to)}`);
            params.push(`ts=${Date.now()}`);

            return `/api/v0/analytics/cab-booking-excel?${params.join("&")}`;
          })()}
          download="cab-booking.xlsx"
          style={{
            padding: "10px 18px",
            background: "#2196f3",
            color: "#fff",
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Download Excel
        </a>
      </div>

      {vendorData && allVendors.length === 0 && !loading && (
        <VendorEmpty appliedFilters={appliedFilters} />
      )}

      {vendorData && displayVendors.length > 0 && (
        <Box mt={2}>
          <VendorStatsCards
            displayVendors={displayVendors}
            appliedFilters={appliedFilters}
          />
          <VendorCardsGrid displayVendors={displayVendors} />
        </Box>
      )}

      {loading && <VendorLoading />}

      {!vendorData && !loading && (
        <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>
          <Typography fontWeight={600}>🚗 Cab Driver Analytics</Typography>
          <Typography>Loading vendor data...</Typography>
        </Paper>
      )}
    </Box>
  );
}
