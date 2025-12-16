// components/ui/BookingLoginActionBar.tsx
import React from "react";
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Tooltip
} from "@mui/material";
import { Add, Search, Download, FilterList } from "@mui/icons-material";
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
  startDateFilter: string;
  onStartDateFilterChange: (value: string) => void;
  endDateFilter: string;
  onEndDateFilterChange: (value: string) => void;
  onExport: () => void; 
  exportLoading: boolean;
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
  startDateFilter,
  onStartDateFilterChange,
  endDateFilter,
  onEndDateFilterChange,
  onExport,
  exportLoading,
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
        flexWrap: "wrap", 
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
            minWidth: { xs: "100%", sm: 281 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          size="small"
        />
        
        {/* Project Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 265 } }}>
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
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 265 } }}>
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
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 265 } }}>
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

        {/* Date Filters */}
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={startDateFilter}
            onChange={(e) => onStartDateFilterChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 100 }, }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={endDateFilter}
            onChange={(e) => onEndDateFilterChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 100 }, }}
          />
          {/* Download Button */}
        <Tooltip title="Download Snapshot">
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={onExport}
            disabled={exportLoading}
            sx={{
              borderRadius: 2,
              minWidth: { xs: "100%", sm: 200 },
              borderColor: "success.main",
              color: "success.main",
              "&:hover": {
                color: "white",
                backgroundColor: "success.light",
              },
            }}
          >
            {exportLoading ? "Exporting..." : "Export"}
          </Button>
        </Tooltip>
        
        {/* Add Booking Button */}
        <PermissionGuard module="booking-login" action="write" fallback={<></>}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            disabled={saving}
            sx={{
              borderRadius: 2,
              minWidth: { xs: "100%", sm: 200 },
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
    </Box>
  );
};

export default BookingLoginActionBar;
