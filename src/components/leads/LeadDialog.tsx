import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@/components/ui/Component";
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
          status: initialData.status?.trim() || "New",
        }}
        validationSchema={leadValidationSchema}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          await onSave(values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, values }) => (
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
                type="submit"
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
              >
                {saving ? <CircularProgress size={20} /> : "Save"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default LeadDialog;
