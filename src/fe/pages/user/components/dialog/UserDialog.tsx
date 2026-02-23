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
import { BUTTON_LABELS } from "@/fe/pages/user/constants/users";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";
import { extractMessage, makeAllTouched } from "@/fe/pages/user/utils";
import { userValidationSchema } from "./user-dialog/validation";
import BasicInformation from "./user-dialog/BasicInformation";
import OrganizationSection from "./user-dialog/OrganizationSection";
import type { UserFormData, UserDialogProps } from "@/fe/pages/user/types";

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
      maxWidth="sm"
      aria-labelledby="user-dialog-title"
      BackdropProps={{
        sx: {
          backdropFilter: "blur(1px)",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
        },
      }}
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          height: "auto",
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        },
      }}
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
                sx={{
                  fontWeight: 600,
                  color: "#1f2937",
                  fontSize: 18,
                  px: 3,
                  pt: 2.5,
                  pb: 1.5,
                  borderBottom: "1px solid #eef2f7",
                }}
              >
                {editId ? BUTTON_LABELS.EDIT_USER : BUTTON_LABELS.ADD_USER}
              </DialogTitle>

              <DialogContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mt: 0,
                  maxHeight: "72vh",
                  overflowY: "auto",
                  px: 3,
                  py: 2,
                  backgroundColor: "#f8fafc",
                }}
              >
                <BasicInformation editId={editId} />
                <OrganizationSection
                  managers={managers}
                  departments={departments}
                  roles={roles}
                  setFieldValue={setFieldValue}
                  currentRoles={values.roles}
                  currentManagerId={values.managerId}
                />
              </DialogContent>

              <DialogActions
                sx={{
                  p: 2,
                  px: 3,
                  borderTop: "1px solid #eef2f7",
                  backgroundColor: "#fff",
                }}
              >
                <Button
                  onClick={onClose}
                  disabled={saving}
                  variant="text"
                  sx={{ fontWeight: 500, color: "#475569" }}
                >
                  {BUTTON_LABELS.CANCEL}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "#2563eb",
                    color: "#fff",
                    px: 3,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                  }}
                  disabled={saving || (editId ? !dirty : false)}
                  onClick={() => {
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
                    <CircularProgress size={20} />
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
