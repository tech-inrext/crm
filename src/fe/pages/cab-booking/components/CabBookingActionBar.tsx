"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Box } from "@/components/ui";
import SearchBar from "@/components/ui/search/SearchBar";
import {
  CAB_BOOKING_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
  statusOptions,
} from "@/fe/pages/cab-booking/constants/cab-booking";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface CabBookingActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const CabBookingActionBar: React.FC<CabBookingActionBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <PageHeader title="Cab Bookings">
      <Box sx={{ display: "flex", gap: 2, flexGrow: 1, alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: "400px" }}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder={SEARCH_PLACEHOLDER}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Status"
            onChange={(e) => onStatusChange(e.target.value as string)}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </PageHeader>
  );
};

export default CabBookingActionBar;
