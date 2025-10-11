"use client";

"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
} from "../Component";
import Alert from "@/components/ui/Component/Alert";
import { Formik, Form } from "formik";
import axios from "axios";
import {
  USERS_API_BASE,
  ROLES_API_BASE,
  DEPARTMENTS_API_BASE,
  BUTTON_LABELS,
} from "@/constants/users";
import { userValidationSchema } from "../user-dialog/validation";
import BasicInformation from "../user-dialog/BasicInformation";
import OrganizationSection from "../user-dialog/OrganizationSection";

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age?: number;
  altPhone?: string;
  fatherName?: string;
  joiningDate?: string;
  designation: string;
  managerId: string;
  departmentId: string;
  roles: string[];
  aadharFile?: File | null;
  panFile?: File | null;
  bankProofFile?: File | null;
  aadharUrl?: string;
  panUrl?: string;
  bankProofUrl?: string;
  nominee?: {
    name?: string;
    phone?: string;
    occupation?: string;
    relation?: string;
    gender?: string;
  };
}

interface UserDialogProps {
  open: boolean;
  editId: string | null;
  initialData: UserFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: UserFormData) => void;
}

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
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const managerParams = new URLSearchParams({
        isCabVendor: "false",
        limit: "1000", // so you don’t get only 5 due to API default
        page: "1",
      }).toString();

      try {
        const [rolesRes, managersRes, departmentsRes] = await Promise.all([
          fetch(`${ROLES_API_BASE}/getAllRoleList`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${USERS_API_BASE}/getAllEmployeeList?${managerParams}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(DEPARTMENTS_API_BASE, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        const rolesData = await rolesRes.json();
        const managersData = await managersRes.json();
        const departmentsData = await departmentsRes.json();

        setRoles(rolesData.data || []);
        setManagers(managersData.data || []);
        setDepartments(departmentsData.data || []);
      } catch (error) {
        console.error("Error fetching dialog data:", error);
      }
    };

    fetchData();
  }, []);

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
        validateOnMount={false}
        enableReinitialize={true}
        onSubmit={async (
          values,
          { setSubmitting, setErrors, setFieldError }
        ) => {
          setSubmitting(true);
          try {
            await onSave(values);
          } catch (e: any) {
            // Try to map server validation errors (400) to Formik field errors
            const resp = e?.response?.data ?? e?.data ?? null;
            if (resp) {
              // Common shapes: { message: '...', error: '...' },
              // { field: 'phone', message: '...' }, or { errors: [{ field, message }] }
              try {
                // If server sent structured field errors
                if (resp.fieldErrors && typeof resp.fieldErrors === "object") {
                  setErrors(resp.fieldErrors);
                  setSnackbarMessage(
                    "Please fix the highlighted errors before submitting"
                  );
                  setSnackbarSeverity("error");
                  setSnackbarOpen(true);
                  return;
                }

                if (Array.isArray(resp.errors) && resp.errors.length > 0) {
                  const fieldErrs: any = {};
                  resp.errors.forEach((it: any) => {
                    if (it.field && it.message)
                      fieldErrs[it.field] = it.message;
                  });
                  if (Object.keys(fieldErrs).length > 0) {
                    setErrors(fieldErrs);
                    setSnackbarMessage(
                      "Please fix the highlighted errors before submitting"
                    );
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                    return;
                  }
                }

                // If server returned single-field info like { field: 'phone', message: '...' }
                if (resp.field && resp.message) {
                  setFieldError(resp.field, resp.message);
                  setSnackbarMessage(
                    "Please fix the highlighted errors before submitting"
                  );
                  setSnackbarSeverity("error");
                  setSnackbarOpen(true);
                  return;
                }

                // fallback: try to extract a usable message string
                const extractMessage = (err: any) => {
                  if (!err) return "Failed to save user";
                  const r = err.response?.data ?? err.data ?? err;
                  if (typeof r === "string") return r;
                  if (r) {
                    if (r.message) return r.message;
                    if (r.msg) return r.msg;
                    if (r.error) return r.error;
                    if (r.data && typeof r.data === "string") return r.data;
                    if (r.data && r.data.message) return r.data.message;
                  }
                  if (err.message) return err.message;
                  try {
                    return JSON.stringify(err);
                  } catch (_) {
                    return "Failed to save user";
                  }
                };

                const msg = extractMessage(e);
                setSnackbarMessage(msg);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
              } catch (parseErr) {
                // parsing error, show generic message
                setSnackbarMessage("Failed to save user");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
              }
            }

            // final fallback
            setSnackbarMessage(e?.message ?? "Failed to save user");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          setFieldValue,
          isValid,
          dirty,
          errors,
          touched,
          values,
          submitForm,
          setTouched,
        }) => {
          return (
            <Form>
              <DialogTitle
                id="user-dialog-title"
                sx={{ fontWeight: 700, color: "#1976d2", fontSize: 20 }}
              >
                {editId ? BUTTON_LABELS.EDIT_USER : BUTTON_LABELS.ADD_USER}
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
                <BasicInformation editId={editId} />
                <OrganizationSection
                  managers={managers}
                  departments={departments}
                  roles={roles}
                  setFieldValue={setFieldValue}
                />
                {/* debug removed */}
              </DialogContent>

              <DialogActions sx={{ p: 2 }}>
                <Button
                  onClick={onClose}
                  disabled={saving}
                  sx={{ fontWeight: 600 }}
                >
                  {BUTTON_LABELS.CANCEL}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
                  disabled={saving || (editId ? !dirty : false)}
                  onClick={() => {
                    // Recursively mark all fields as touched so field-level errors show
                    const makeAllTouched = (obj) => {
                      if (obj === null || obj === undefined) return true;
                      if (typeof obj !== "object") return true;
                      if (Array.isArray(obj)) return obj.map(() => true);
                      const out: any = {};
                      Object.keys(obj).forEach((k) => {
                        out[k] = makeAllTouched(obj[k]);
                      });
                      return out;
                    };

                    try {
                      const allTouched = makeAllTouched(values || {});
                      setTouched(allTouched);
                    } catch (_) {
                      // fallback: mark top-level keys
                      const allTouched: any = {};
                      Object.keys(values || {}).forEach(
                        (k) => (allTouched[k] = true)
                      );
                      setTouched(allTouched);
                    }

                    // always submit; Formik will validate and fill errors which will now be visible
                    submitForm();
                  }}
                >
                  {saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : editId ? (
                    BUTTON_LABELS.SAVE
                  ) : (
                    BUTTON_LABELS.ADD
                  )}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default UserDialog;
