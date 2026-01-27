import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
} from "@/components/ui/Component";



import { Field, FieldProps } from "formik";
import { useAuth } from "@/contexts/AuthContext";
import { teamHierarchyService } from "@/services/team-hierarchy.service";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "follow-up", label: "Follow-Up" },
  { value: "call back", label: "Call Back" },
  { value: "not connected", label: "Not Connected" },
  { value: "details shared", label: "Details Shared" },
  { value: "site visit done", label: "Site Visit Done" },
  { value: "closed", label: "Closed" },
  { value: "not interested", label: "Not Interested" },
  // { value: "", label: "No Status" }, // optional placeholder for empty
];

const sourceOptions = [
  { value: "Website", label: "Website" },
  { value: "Referral", label: "Referral" },
  { value: "Raw Data", label: "Raw Data" },
  { value: "Social Media", label: "Social Media" },
  { value: "Google", label: "Google" },
  { value: "Activity", label: "Activity" },
  { value: "Direct Call", label: "Direct Call" },
];

interface LeadManagementProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  users: any[];
}

const LeadManagement: React.FC<LeadManagementProps> = ({
  values,
  setFieldValue,
  users,
}) => {
  const { user } = useAuth();

  // Auto-select logged in user as manager when adding a new lead
  useEffect(() => {
    // Only set manager if there's a logged-in user and no manager already in form
    if (user && !values.manager && !values.managerId) {
      // keep the form field name as 'manager' (UI-only). Do not override when editing.
      setFieldValue("manager", user._id);
      // also set managerId so it gets included when submitting to backend
      setFieldValue("managerId", user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // memoize filtered assignedTo options based on selected manager
  const selectedManagerId =
    values.manager || values.managerId || user?._id || "";

  const assignedToOptions = useMemo(() => {
    if (!users || users.length === 0) return [];
    // show only users whose managerId matches the selected manager
    return users.filter(
      (u: any) => String(u.managerId || "") === String(selectedManagerId)
    );
  }, [users, selectedManagerId]);

  // For larger orgs prefer fetching the manager's direct reports from the server
  const [teamMembers, setTeamMembers] = useState<any[] | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchTeam = async () => {
      if (!selectedManagerId) {
        setTeamMembers(null);
        return;
      }
      try {
        const res = await teamHierarchyService.fetchHierarchy(
          String(selectedManagerId)
        );
        // The API returns an object with nested employees; if it returns array use it directly
        const members =
          res?.employees || res?.team || (Array.isArray(res) ? res : []);
        if (mounted) setTeamMembers(members || []);
      } catch (err) {
        // on error fallback to client-side filtering
        if (mounted) setTeamMembers([]);
      }
    };
    fetchTeam();
    return () => {
      mounted = false;
    };
  }, [selectedManagerId]);

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
        Lead Management
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="status">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label="Status"
              select
              value={values.status}
              onChange={(e) => setFieldValue("status", e.target.value)}
              inputProps={{ "aria-label": "Lead status" }}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            >
              <MenuItem value="">Select status...</MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>

        <Field name="manager">
          {({ field, meta }: FieldProps) => (
            <Autocomplete
              options={users}
              getOptionLabel={(option) => option.name || ""}
              getOptionKey={(option) => option._id || option.id}
              value={
                users.find((u) => u._id === (values.manager || user?._id)) ||
                null
              }
              onChange={(_, newValue) => {
                // Set selected manager id in form and clear assignedTo (team will change)
                const id = newValue ? newValue._id : "";
                setFieldValue("manager", id);
                setFieldValue("managerId", id);
                setFieldValue("assignedTo", "");
              }}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Manager"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                  placeholder="Search and select employee"
                  sx={{ bgcolor: "#fff", borderRadius: 1 }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box
                    component="li"
                    key={option._id || option.id || key}
                    {...rest}
                  >
                    {option.name}
                  </Box>
                );
              }}
              noOptionsText="No employees found"
              clearOnBlur
              selectOnFocus
            />
          )}
        </Field>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="source">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label="Source"
              select
              value={values.source}
              onChange={(e) => setFieldValue("source", e.target.value)}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              inputProps={{ "aria-label": "Lead source" }}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1, height: 56 }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
            >
              <MenuItem value="">Select source...</MenuItem>
              {sourceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>


      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="assignedTo">
          {({ field, meta }: FieldProps) => (
            <Autocomplete
              options={
                teamMembers && teamMembers.length > 0
                  ? teamMembers
                  : assignedToOptions
              }
              getOptionLabel={(option) => option.name || ""}
              getOptionKey={(option) => option._id || option.id}
              value={
                users.find((user) => user._id === values.assignedTo) || null
              }
              onChange={(_, newValue) => {
                setFieldValue("assignedTo", newValue ? newValue._id : "");
              }}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned To"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                  placeholder="Search and select employee"
                  sx={{ bgcolor: "#fff", borderRadius: 1 }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box
                    component="li"
                    key={option._id || option.id || key}
                    {...rest}
                  >
                    {option.name}
                  </Box>
                );
              }}
              noOptionsText="No employees found"
              clearOnBlur
              selectOnFocus
            />
          )}
        </Field>
      </Box>
    </>
  );
};

export default LeadManagement;
