import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
  Autocomplete,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  Badge as HrIcon,
  People as PeopleIcon,
  FilterList as FilterIcon,
  InboxOutlined as InboxIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import LeaveStatsCards from "./LeaveStatsCards";
import { tableContainerSx, tableHeaderSx, tableRowSx } from "../styles";

interface EmployeeOption {
  _id: string;
  name: string;
  employeeProfileId?: string;
  photo?: string;
}

const HrLeavesOverview: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(false);

  // Fetch all employees for dropdown selector
  useEffect(() => {
    const fetchEmployeeList = async () => {
      setEmpLoading(true);
      try {
        const res = await fetch("/api/v0/employee/getAllEmployeeList");
        const json = await res.json();
        if (json?.data || json?.employees) {
          const list = json.data || json.employees;
          setEmployees(list);
        } else if (Array.isArray(json)) {
          setEmployees(json);
        }
      } catch (err) {
        console.error("Error loading employee list:", err);
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployeeList();
  }, []);

  // Fetch leaves based on selected employee and status filter
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAllLeaves({
        employeeId: selectedEmployee?._id,
        status: statusFilter,
        limit: 100,
      });
      if (res?.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [selectedEmployee, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Cancelled": return "default";
      default: return "warning";
    }
  };

  return (
    <Box>
      {/* Header & Controls Bar */}
      <Box sx={{ mb: 3.5, display: "flex", flexDirection: { xs: "column", lg: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" }, gap: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <HrIcon sx={{ color: "#1976d2", fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight="700" color="#1e293b">
              All Employees Leave Dashboard
            </Typography>
            <Typography variant="body2" color="#64748b">
              HR Portal for leave quotas, history, and status checks
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ width: { xs: "100%", lg: "auto" } }}>
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => `${option.name} ${option.employeeProfileId ? `(${option.employeeProfileId})` : ""}`}
            value={selectedEmployee}
            onChange={(_, newValue) => setSelectedEmployee(newValue)}
            loading={empLoading}
            sx={{ minWidth: { xs: "100%", sm: 340 }, flex: { sm: 1, lg: "initial" } }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 2.5,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  mt: 1,
                  minWidth: 350,
                },
              },
            }}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props as any;
              return (
                <Box component="li" key={option._id} {...optionProps} display="flex" alignItems="center" gap={1.5} py={1}>
                  <Avatar src={option.photo} sx={{ width: 32, height: 32, bgcolor: "#1976d2", fontSize: 14 }}>
                    {option.name?.[0]}
                  </Avatar>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="body2" fontWeight="600" noWrap>{option.name}</Typography>
                    {option.employeeProfileId && (
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>{option.employeeProfileId}</Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Employee"
                placeholder="All Employees"
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, backgroundColor: "white" } }}
              />
            )}
          />

          <TextField
            select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            variant="outlined"
            sx={{ minWidth: { xs: "100%", sm: 200 }, "& .MuiOutlinedInput-root": { borderRadius: 2.5, backgroundColor: "white" } }}
            InputProps={{
              startAdornment: <FilterIcon sx={{ color: "#94a3b8", mr: 1 }} />,
            }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending Only</MenuItem>
            <MenuItem value="Approved">Approved Only</MenuItem>
            <MenuItem value="Rejected">Rejected Only</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* If a specific employee is selected, render their individual quota stats */}
      {selectedEmployee && (
        <Box mb={4}>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, bgcolor: "#e0f2fe", border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleIcon sx={{ color: "#0288d1" }} />
            <Typography variant="body1" fontWeight="600" color="#0369a1">
              Showing leave quota and statistics for: <strong>{selectedEmployee.name}</strong>
            </Typography>
          </Paper>
          <LeaveStatsCards employeeId={selectedEmployee._id} />
        </Box>
      )}

      {/* Leave History Master Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8, minHeight: 300 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: "#1976d2" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={tableContainerSx}>
          <Table>
            <TableHead sx={tableHeaderSx}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="center">Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Approver (Manager)</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Applied Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#64748b" }}>
                    <InboxIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography>No leave records found for the selected criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => {
                  const emp: any = leave.employeeId;
                  const mgr: any = leave.managerId;

                  return (
                    <TableRow key={leave._id} sx={tableRowSx}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar src={emp?.photo} sx={{ width: 34, height: 34, bgcolor: "#1976d2" }}>
                            {emp?.name?.[0] || "E"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600" color="#334155">
                              {emp?.name || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">
                              {emp?.employeeProfileId || emp?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#334155">{leave.leaveType}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`${leave.daysRequested} Day(s)`} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: "#cbd5e1" }} />
                      </TableCell>
                      <TableCell sx={{ color: "#475569", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {leave.reason}
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {mgr?.name ? (
                          <Typography variant="body2">{mgr.name}</Typography>
                        ) : (
                          <Typography variant="caption" color="#94a3b8">N/A</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={leave.status}
                          color={getStatusColor(leave.status) as any}
                          sx={{ fontWeight: 600, px: 1 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                        {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default HrLeavesOverview;
