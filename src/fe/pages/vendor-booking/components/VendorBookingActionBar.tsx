"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Box, MenuItem, Select, FilterAltIcon, Typography } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import { SEARCH_PLACEHOLDER, BOOKING_STATUSES } from "../constants";
import * as styles from "./styles";
import { VendorBookingActionBarProps } from "../types";

const VendorBookingActionBar: React.FC<VendorBookingActionBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <PageHeader
      title="Vendor Bookings"
      subtitle="Your assigned cab bookings — fill in details for active bookings"
    >
      <Box sx={{ display: "flex", gap: 2, width: "100%", maxWidth: "800px", flexGrow: 1, alignItems: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder={SEARCH_PLACEHOLDER}
          />
        </Box>
        
        <Box sx={{ minWidth: "180px" }}>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as string)}
            size="small"
            fullWidth
            startAdornment={
              <FilterAltIcon sx={{ color: "text.secondary", mr: 1, fontSize: 18 }} />
            }
            sx={{ bgcolor: "white", borderRadius: 1 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {BOOKING_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </PageHeader>
  );
};

export default VendorBookingActionBar;
