"use client";

import React from "react";
import {
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { Search } from "@mui/icons-material";

interface FilterControlsProps {
  searchQuery: string;
  sortBy: "date" | "priority" | "type";
  sortOrder: "asc" | "desc";
  filterType: string;
  filterPriority: string;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: "date" | "priority" | "type") => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onFilterTypeChange: (value: string) => void;
  onFilterPriorityChange: (value: string) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  sortBy,
  sortOrder,
  filterType,
  filterPriority,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onFilterTypeChange,
  onFilterPriorityChange,
}) => (
  <Card className="mb-3 overflow-visible">
    <CardContent className="p-2 sm:p-3">
      <div className="flex flex-col gap-2">
        <TextField
          fullWidth
          size="small"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            className: "text-sm sm:text-base bg-gray-50",
          }}
        />

        <div className="flex gap-1.5 flex-wrap items-center">
          <Typography variant="body2" className="hidden sm:block text-gray-600 font-medium mr-1">
            Sort By:
          </Typography>
          <FormControl size="small" className="min-w-[100px] sm:min-w-[120px]">
            <InputLabel className="text-sm">Date</InputLabel>
            <Select value={sortBy} label="Date" onChange={(e) => onSortByChange(e.target.value as any)} className="text-sm">
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="type">Type</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" className="min-w-[100px] sm:min-w-[120px]">
            <InputLabel className="text-sm">Order</InputLabel>
            <Select value={sortOrder} label="Order" onChange={(e) => onSortOrderChange(e.target.value as any)} className="text-sm">
              <MenuItem value="desc">Newest</MenuItem>
              <MenuItem value="asc">Oldest</MenuItem>
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem className="hidden sm:block mx-1" />

          <Typography variant="body2" className="hidden sm:block text-gray-600 font-medium mr-1">
            Filters:
          </Typography>

          <FormControl size="small" className="min-w-[100px] sm:min-w-[130px]">
            <InputLabel className="text-sm">Type</InputLabel>
            <Select value={filterType} label="Type" onChange={(e) => onFilterTypeChange(e.target.value)} className="text-sm">
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="LEAD_ASSIGNED">Lead Assigned</MenuItem>
              <MenuItem value="LEAD_FOLLOWUP_DUE">Follow-up Due</MenuItem>
              <MenuItem value="LEAD_STATUS_UPDATE">Status Update</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" className="min-w-[100px] sm:min-w-[140px]">
            <InputLabel className="text-sm">Priority</InputLabel>
            <Select value={filterPriority} label="Priority" onChange={(e) => onFilterPriorityChange(e.target.value)} className="text-sm">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    </CardContent>
  </Card>
);
