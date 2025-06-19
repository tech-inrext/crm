"use client";

import React, { useState, useEffect } from "react";
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { Edit, PersonAdd } from "@mui/icons-material";
import axios from "axios";

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: { _id: string; name: string } | string; // Backend returns role object or string
  roles?: { _id: string; name: string }[]; // Backend returns array of role objects
  designation: string;
}

interface Role {
  _id: string;
  name: string;
}

const UserRoleManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadRoles();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await axios.get("/api/v0/employee");
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await axios.get("/api/v0/role");
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };
  const handleEditRoles = (employee: Employee) => {
    const getRoleName = (role: any) =>
      typeof role === "string" ? role : role?.name || "";
    const primaryRoleName = getRoleName(employee.role);
    const allRoleNames = employee.roles
      ? employee.roles.map(getRoleName)
      : [primaryRoleName];

    setSelectedEmployee(employee);
    setSelectedRoles(allRoleNames);
    setDialogOpen(true);
  };

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRoles(typeof value === "string" ? value.split(",") : value);
  };
  const handleSaveRoles = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      console.log("Sending PATCH request with data:", {
        roles: selectedRoles, // Send role names as strings
        currentRole: selectedRoles[0],
        role: selectedRoles[0], // Primary role
      });

      const response = await axios.patch(
        `/api/v0/employee/${selectedEmployee._id}`,
        {
          roles: selectedRoles, // Backend expects role names as strings
          currentRole: selectedRoles[0], // Set first role as current
          role: selectedRoles[0], // Set first role as primary
        }
      );

      console.log("PATCH response:", response.data);

      // Reload employees to get fresh data from backend
      await loadEmployees();

      setDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error("Failed to update roles:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
      >
        <PersonAdd />
        User Role Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Primary Role</TableCell>
              <TableCell>All Roles</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {" "}
            {employees.map((employee) => {
              const getRoleName = (role: any) =>
                typeof role === "string" ? role : role?.name || "No Role";
              const primaryRoleName = getRoleName(employee.role);
              const allRoleNames = employee.roles
                ? employee.roles.map(getRoleName)
                : [primaryRoleName];

              return (
                <TableRow key={employee._id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    <Chip
                      label={primaryRoleName}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {allRoleNames.map((roleName) => (
                        <Chip
                          key={roleName}
                          label={roleName}
                          size="small"
                          variant={
                            roleName === primaryRoleName ? "filled" : "outlined"
                          }
                          color={
                            roleName === primaryRoleName ? "primary" : "default"
                          }
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => handleEditRoles(employee)}
                      size="small"
                    >
                      Edit Roles
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Roles to {selectedEmployee?.name}</DialogTitle>
        <DialogContent>
          {" "}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Roles</InputLabel>
            <Select<string[]>
              multiple
              value={selectedRoles}
              onChange={handleRoleChange}
              input={<OutlinedInput label="Select Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {Array.isArray(selected)
                    ? selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))
                    : null}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveRoles}
            variant="contained"
            disabled={loading || selectedRoles.length === 0}
          >
            Save Roles
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRoleManagement;
