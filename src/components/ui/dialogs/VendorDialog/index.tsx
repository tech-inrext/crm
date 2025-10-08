"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Formik, Form } from "formik";
import axios from "axios";
import {
  VENDORS_API_BASE,
  ROLES_API_BASE,
  DEPARTMENTS_API_BASE,
  BUTTON_LABELS,
} from "@/constants/vendors";
import {
  vendorValidationSchema,
  vendorAddValidationSchema,
} from "../../vendor-dialog/validation";
import BasicInformation from "../../vendor-dialog/BasicInformation";
export interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  age?: number;
  altPhone?: string;
  joiningDate?: string;
  designation: string;
  managerId: string;
  departmentId: string;
  roles: string[];
}

interface VendorDialogProps {
  open: boolean;
  editId: string | null;
  initialData: VendorFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: VendorFormData) => void;
}

const VendorDialog: React.FC<VendorDialogProps> = ({
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
    const fetchData = async () => {
      try {
        const [rolesRes, employeesRes, departmentsRes] = await Promise.all([
          fetch(`${ROLES_API_BASE}/getAllRoleList`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/api/v0/employee/getAllEmployeeList", {
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
        const employeesData = await employeesRes.json();
        const departmentsData = await departmentsRes.json();

        setRoles(rolesData.data || []);
        // Filter cab vendors from employees
        const cabVendors = (employeesData.data || []).filter(
          (emp) => emp.isCabVendor
        );
        setManagers(cabVendors);
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
      aria-labelledby="vendor-dialog-title"
      PaperProps={{ sx: { maxHeight: "90vh", height: "auto" } }}
    >
      <Formik
        initialValues={initialData}
        validationSchema={
          editId ? vendorValidationSchema : vendorAddValidationSchema
        }
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          await onSave(values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, isValid }) => (
          <Form>
            <DialogTitle
              id="vendor-dialog-title"
              sx={{ fontWeight: 700, color: "#1976d2", fontSize: 20 }}
            >
              {editId ? BUTTON_LABELS.EDIT_VENDOR : BUTTON_LABELS.ADD_VENDOR}
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
                type="submit"
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
                disabled={saving || !isValid}
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
        )}
      </Formik>
    </Dialog>
  );
};

export default VendorDialog;
