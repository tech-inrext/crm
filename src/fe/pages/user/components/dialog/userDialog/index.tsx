"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import {
  CircularProgress,
  CloseIcon,
  Button,
  IconButton,
} from "@/components/ui/Component";
import { BUTTON_LABELS } from "@/fe/pages/user/constants/users";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";
import { makeAllTouched, resolveFileUploads } from "@/fe/pages/user/utils";
import { userValidationSchema } from "./validation";
import PhotoUpload from "./PhotoUpload";
import BasicInformation from "./BasicInformation";
import OrganizationSection from "./OrganizationSection";
import ForFreelancer from "./ForFreelancer";
import RequiredDocuments from "./RequiredDocuments";
import NomineeSection from "./NomineeSection";
import type { UserFormData, UserDialogProps } from "@/fe/pages/user/types";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/fe/pages/user/userApi";

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  editId,
  initialData,
  onClose,
  onSave,
}) => {
  const { roles, managers, departments } = useUserDialogData(open);
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const { mutate: handleUserSave, loading: saving = false } = editId
    ? updateMutation
    : createMutation;

  if (!open) return null;

  const handleSubmit = async (values: UserFormData) => {
    const payload = await resolveFileUploads(values);
    if (editId) {
      await handleUserSave({ ...payload, id: editId }, onSave);
    } else {
      await handleUserSave(payload, onSave);
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-9999"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-10000 flex items-center justify-center pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col pointer-events-auto"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[17px] font-semibold text-slate-800">
              {editId ? BUTTON_LABELS.EDIT_USER : BUTTON_LABELS.ADD_USER}
            </h2>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="Close dialog"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <Formik
            initialValues={initialData}
            validationSchema={userValidationSchema}
            validateOnMount={false}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, dirty, values, submitForm, setTouched }) => (
              <Form className="flex flex-col min-h-0">
                <div
                  className="overflow-y-auto px-6 py-4 bg-slate-50 flex flex-col gap-4"
                  style={{ maxHeight: "calc(90vh - 130px)" }}
                >
                  <div className="flex justify-center my-2">
                    <div className="w-36">
                      <PhotoUpload />
                    </div>
                  </div>
                  <BasicInformation editId={editId} />
                  <ForFreelancer />
                  <RequiredDocuments />
                  <NomineeSection />
                  <OrganizationSection
                    managers={managers}
                    departments={departments}
                    roles={roles}
                    setFieldValue={setFieldValue}
                    currentRoles={values.roles}
                    currentManagerId={values.managerId}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-100 bg-white rounded-b-2xl">
                  <Button variant="text" onClick={onClose} disabled={saving}>
                    {BUTTON_LABELS.CANCEL}
                  </Button>
                  <Button
                    variant="contained"
                    disabled={saving || (!!editId && !dirty)}
                    onClick={() => {
                      setTouched(makeAllTouched(values));
                      submitForm();
                    }}
                    startIcon={
                      saving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {saving
                      ? "Saving…"
                      : editId
                        ? BUTTON_LABELS.SAVE
                        : BUTTON_LABELS.ADD}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default UserDialog;
