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
  USERS_API_BASE,
  ROLES_API_BASE,
  DEPARTMENTS_API_BASE,
  BUTTON_LABELS,
} from "@/constants/users";
import { userValidationSchema } from "./user-dialog/validation";
import BasicInformation from "./user-dialog/BasicInformation";
import OrganizationSection from "./user-dialog/OrganizationSection";

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
        validateOnMount={true}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          await onSave(values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, isValid, dirty, errors, touched, values }) => {
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
                  type="submit"
                  variant="contained"
                  sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
                  disabled={saving || !isValid || (editId ? !dirty : false)}
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
    </Dialog>
  );
};

export default UserDialog;
