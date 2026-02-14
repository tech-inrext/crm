"use client";

import React, { useState } from "react";
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
import { BUTTON_LABELS } from "@/fe/modules/user/constants/users";
import { useUserDialogData } from "@/fe/modules/user/hooks/useUserDialogData";
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
  specialization?: string;
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
  photoFile?: File | null;
  photoUrl?: string;
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
  const { roles, managers, departments } = useUserDialogData(open);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  // roles/managers/departments are provided by `useUserDialogData`

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
          { setSubmitting, setErrors, setFieldError },
        ) => {
          setSubmitting(true);
          try {
            await onSave(values);
          } catch (e: any) {
            const resp = e?.response?.data ?? e?.data ?? null;
            if (resp) {
              try {
                if (resp.fieldErrors && typeof resp.fieldErrors === "object") {
                  setErrors(resp.fieldErrors);
                  setSnackbarMessage(
                    "Please fix the highlighted errors before submitting",
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
                      "Please fix the highlighted errors before submitting",
                    );
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                    return;
                  }
                }

                if (resp.field && resp.message) {
                  setFieldError(resp.field, resp.message);
                  setSnackbarMessage(
                    "Please fix the highlighted errors before submitting",
                  );
                  setSnackbarSeverity("error");
                  setSnackbarOpen(true);
                  return;
                }

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
                setSnackbarMessage("Failed to save user");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
              }
            }

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
                  currentRoles={values.roles}
                />
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
                      const allTouched: any = {};
                      Object.keys(values || {}).forEach(
                        (k) => (allTouched[k] = true),
                      );
                      setTouched(allTouched);
                    }

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
