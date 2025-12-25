import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
} from "@/components/ui/Component";
import Alert from "@/components/ui/Component/Alert";
import { Formik, Form } from "formik";
import axios from "axios";
import {
  BasicInformation,
  PropertyDetails,
  LeadManagement,
  Notes,
} from "./form-sections";
import { leadValidationSchema } from "./leadValidation";

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  propertyName: string;
  propertyType: string;
  location: string;
  budgetRange: string;
  status: string;
  source: string;
  assignedTo?: string;
  nextFollowUp?: string;
  followUpNotes: Array<{ note: string }>;
}

interface LeadDialogProps {
  open: boolean;
  editId: string | null;
  initialData: LeadFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: LeadFormData) => void;
}

const LeadDialog: React.FC<LeadDialogProps> = ({
  open,
  editId,
  initialData,
  saving,
  onClose,
  onSave,
}) => {
  const [users, setUsers] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (open) {
      axios
        .get("/api/v0/employee/getAllEmployeeList")
        .then((res) => setUsers(res.data.data || []));
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="lead-dialog-title"
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          height: "auto",
        },
      }}
    >
      <Formik
        initialValues={{
          ...initialData,
          propertyName: initialData.propertyName ?? "",
          status: initialData.status?.trim() || "new",
        }}
        validationSchema={leadValidationSchema}
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
                  if (!err) return "Failed to save lead";
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
                    return "Failed to save lead";
                  }
                };

                const msg = extractMessage(e);
                setSnackbarMessage(msg);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
              } catch (parseErr) {
                // parsing error, show generic message
                setSnackbarMessage("Failed to save lead");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
              }
            }

            // final fallback
            setSnackbarMessage(e?.message ?? "Failed to save lead");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ setFieldValue, values, submitForm, setTouched, dirty }) => (
          <Form>
            <DialogTitle
              id="lead-dialog-title"
              sx={{ fontWeight: 700, color: "#1976d2", fontSize: 20 }}
            >
              {editId ? "Edit Lead" : "Add Lead"}
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
              <BasicInformation
                values={values}
                setFieldValue={setFieldValue}
                editId={editId}
              />
              <PropertyDetails values={values} setFieldValue={setFieldValue} />
              <LeadManagement
                values={values}
                setFieldValue={setFieldValue}
                users={users}
              />
              <Notes values={values} setFieldValue={setFieldValue} />
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
                type="button"
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
                disabled={saving}
                onClick={() => {
                  // Recursively mark all fields as touched so field-level errors show
                  const makeAllTouched = (obj: any) => {
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
                {saving ? <CircularProgress size={20} /> : "Save"}
              </Button>
            </DialogActions>
          </Form>
        )}
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

export default LeadDialog;
