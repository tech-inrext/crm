// components/ui/BookingLoginActionBar.tsx
import React from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import { SEARCH_PLACEHOLDER } from "@/constants/bookingLogin";
import { STATUS_OPTIONS } from "@/constants/bookingLogin";

interface BookingLoginActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
  projectFilter: string;
  onProjectFilterChange: (value: string) => void;
  teamHeadFilter: string;
  onTeamHeadFilterChange: (value: string) => void;
  statusFilter: string; 
  onStatusFilterChange: (value: string) => void; 
  projectOptions: string[];
  teamHeadOptions: string[];
}

const BookingLoginActionBar: React.FC<BookingLoginActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
  projectFilter,
  onProjectFilterChange,
  teamHeadFilter,
  onTeamHeadFilterChange,
  statusFilter, 
  onStatusFilterChange, 
  projectOptions,
  teamHeadOptions,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        flex: 1,
        alignItems: { xs: "stretch", sm: "center" }
      }}>
        {/* Search Field */}
        <TextField
          placeholder={SEARCH_PLACEHOLDER}
          value={search}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
          }}
          sx={{
            minWidth: { xs: "100%", sm: 250 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          size="small"
        />
        
        {/* Project Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={projectFilter}
            label="Project"
            onChange={(e) => onProjectFilterChange(e.target.value)}
          >
            <MenuItem value="">All Projects</MenuItem>
            {projectOptions.map((project) => (
              <MenuItem key={project} value={project}>
                {project}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Team Head Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
          <InputLabel>Team Head</InputLabel>
          <Select
            value={teamHeadFilter}
            label="Team Head"
            onChange={(e) => onTeamHeadFilterChange(e.target.value)}
          >
            <MenuItem value="">All Team Heads</MenuItem>
            {teamHeadOptions.map((teamHead) => (
              <MenuItem key={teamHead} value={teamHead}>
                {teamHead}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <PermissionGuard module="booking-login" action="write" fallback={<></>}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          disabled={saving}
          sx={{
            borderRadius: 2,
            minWidth: 120,
            background: "#1976d2",
            "&:hover": {
              background: "#1976d2",
            },
          }}
        >
          Add Booking
        </Button>
      </PermissionGuard>
    </Box>
  );
};

export default BookingLoginActionBar;

