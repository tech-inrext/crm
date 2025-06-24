"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { Formik, Form, Field, FieldProps } from "formik";
import * as Yup from "yup";
import axios from "axios";

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age?: number;
  altPhone?: string;
  joiningDate?: string;
  designation: string;
  managerId: string;
  departmentId: string;
  roles: string[];
}

interface UserDialogProps {
  open: boolean;
  editId: string | null;
  initialData: UserFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: UserFormData) => void;
}

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const userValidationSchema = Yup.object({
  name: Yup.string().min(2).max(50).required("Name is required"),
  email: Yup.string().email().required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  address: Yup.string().min(5).required("Address is required"),
  gender: Yup.string()
    .oneOf(["Male", "Female", "Other"])
    .required("Gender is required"),
  age: Yup.number().min(0).max(120).nullable(),
  altPhone: Yup.string().nullable(),
  joiningDate: Yup.string().nullable(),
  designation: Yup.string().min(2).max(50).required("Designation is required"),
  managerId: Yup.string().required("Manager is required"),
  departmentId: Yup.string().required("Department is required"),
  roles: Yup.array().of(Yup.string()).min(1, "At least one role required"),
});

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  editId,
  initialData,
  saving,
  onClose,
  onSave,
}) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      axios.get("/api/v0/role").then((res) => setRoles(res.data.data || []));
      axios
        .get("/api/v0/employee")
        .then((res) => setManagers(res.data.data || []));
      axios
        .get("/api/v0/department")
        .then((res) => setDepartments(res.data.data || []));
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="user-dialog-title"
      PaperProps={{ sx: { maxHeight: "90vh", height: "auto" } }}
    >
      <Formik
        initialValues={initialData}
        validationSchema={userValidationSchema}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          await onSave(values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, isValid, values }) => (
          <Form>
            <DialogTitle
              id="user-dialog-title"
              sx={{ fontWeight: 700, color: "#1976d2", fontSize: 20 }}
            >
              {editId ? "Edit User" : "Add User"}
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mt: 1,
                maxHeight: "70vh",
                overflowY: "auto",
                px: 3,
              }}
            >
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Field name="name">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    {...field}
                    label="Full Name *"
                    autoFocus
                    fullWidth
                    margin="normal"
                    error={!!meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    sx={{ bgcolor: "#fff", borderRadius: 1 }}
                  />
                )}
              </Field>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Field name="email">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Email *"
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                      InputProps={{ readOnly: !!editId }}
                    />
                  )}
                </Field>
                <Field name="phone">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Phone *"
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                      InputProps={{ readOnly: !!editId }}
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
                <Field name="altPhone">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Alternate Phone"
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    />
                  )}
                </Field>
                <Field name="address">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Address *"
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
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
                <Field name="gender">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Gender *"
                      select
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>
                <Field name="age">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Age"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
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
                <Field name="joiningDate">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Joining Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    />
                  )}
                </Field>
                <Field name="designation">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Designation *"
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    />
                  )}
                </Field>
              </Box>
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                Organization
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Field name="managerId">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Manager *"
                      select
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      {managers.map((mgr) => (
                        <MenuItem key={mgr._id} value={mgr._id}>
                          {mgr.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>
                <Field name="departmentId">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Department *"
                      select
                      fullWidth
                      margin="normal"
                      error={!!meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      {departments.map((dept) => (
                        <MenuItem
                          key={dept.departmentId}
                          value={dept.departmentId}
                        >
                          {dept.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>
              </Box>
              <Field name="roles">
                {({ field, meta }: FieldProps) => (
                  <Autocomplete
                    multiple
                    options={roles}
                    getOptionLabel={(option) => option.name || ""}
                    value={roles.filter((r) =>
                      (field.value ?? []).includes(r._id)
                    )}
                    onChange={(_, value) =>
                      setFieldValue(
                        "roles",
                        value.map((v) => v._id)
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Roles *"
                        margin="normal"
                        error={!!meta.touched && !!meta.error}
                        helperText={meta.touched && meta.error}
                        sx={{ bgcolor: "#fff", borderRadius: 1 }}
                      />
                    )}
                    sx={{ mt: 2 }}
                  />
                )}
              </Field>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={onClose}
                disabled={saving}
                sx={{ fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
                disabled={saving || !isValid}
              >
                {saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : editId ? (
                  "Save"
                ) : (
                  "Add"
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserDialog;
