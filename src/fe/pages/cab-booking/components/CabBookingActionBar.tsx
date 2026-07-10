"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Box } from "@/components/ui";
import SearchBar from "@/components/ui/search/SearchBar";
import {
  CAB_BOOKING_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
  statusOptions,
} from "@/fe/pages/cab-booking/constants/cab-booking";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Checkbox, ListItemText, Autocomplete, TextField } from "@mui/material";

interface CabBookingActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string[];
  onStatusChange: (status: string[]) => void;
  bookedByFilter?: string;
  onBookedByChange?: (bookedBy: string) => void;
  isSystemAdmin?: boolean;
}

const CabBookingActionBar: React.FC<CabBookingActionBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  bookedByFilter = "",
  onBookedByChange,
  isSystemAdmin = false,
}) => {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (isSystemAdmin) {
      fetch("/api/v0/employee/getAllEmployeeList")
        .then(res => res.json())
        .then(payload => setEmployees(payload.data || payload))
        .catch(console.error);
    }
  }, [isSystemAdmin]);
  return (
    <PageHeader title="Cab Bookings">
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, flexGrow: 1, alignItems: "center", width: "100%" }}>
        <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "250px" }, maxWidth: { sm: "400px" } }}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder={SEARCH_PLACEHOLDER}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 }, flexGrow: { xs: 1, sm: 0 } }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            multiple
            value={statusFilter}
            label="Status"
            onChange={(e: SelectChangeEvent<string[]>) => {
              const value = e.target.value;
              onStatusChange(typeof value === "string" ? value.split(",") : value);
            }}
            renderValue={(selected) => 
              selected.map(val => statusOptions.find(opt => opt.value === val)?.label || val).join(", ")
            }
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Checkbox checked={statusFilter.indexOf(opt.value) > -1} />
                <ListItemText primary={opt.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isSystemAdmin && onBookedByChange && (
          <Autocomplete
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 200 }, flexGrow: { xs: 1, sm: 0 }, bgcolor: "white" }}
            options={employees}
            getOptionLabel={(emp) => emp.name || emp.username || emp.email || "Unknown"}
            value={employees.find((emp) => emp._id === bookedByFilter) || null}
            onChange={(event, newValue) => {
              onBookedByChange(newValue ? newValue._id : "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Booked By" placeholder="Search Agents..." />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={option._id || key} {...otherProps}>
                  {option.name || option.username || option.email || "Unknown"}
                </li>
              );
            }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            noOptionsText="No agents found"
          />
        )}
      </Box>
    </PageHeader>
  );
};

export default CabBookingActionBar;
