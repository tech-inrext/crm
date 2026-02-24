"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import { BUTTON_LABELS } from "@/fe/pages/user/constants/users";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";
import { extractMessage, makeAllTouched } from "@/fe/pages/user/utils";
import { userValidationSchema } from "./validation";
import BasicInformation from "./BasicInformation";
import OrganizationSection from "./OrganizationSection";
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
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  if (!open) return null;

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      {/* Dim layer — only catches outside-panel clicks to close */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering wrapper — pointer-events-none so it never intercepts clicks */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
        {/* Panel — pointer-events-auto re-enables all interactions within */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col pointer-events-auto"
          style={{ maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[17px] font-semibold text-slate-800">
              {editId ? BUTTON_LABELS.EDIT_USER : BUTTON_LABELS.ADD_USER}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formik Form */}
          <Formik
            initialValues={initialData}
            validationSchema={userValidationSchema}
            validateOnMount={false}
            enableReinitialize={true}
            onSubmit={async (values, { setSubmitting, setErrors, setFieldError }) => {
              setSubmitting(true);
              try {
                await onSave(values);
              } catch (e: any) {
                const resp = e?.response?.data ?? e?.data ?? null;
                if (resp) {
                  try {
                    if (resp.fieldErrors && typeof resp.fieldErrors === "object") {
                      setErrors(resp.fieldErrors);
                      showToast("Please fix the highlighted errors before submitting");
                      return;
                    }
                    if (Array.isArray(resp.errors) && resp.errors.length > 0) {
                      const fieldErrs: Record<string, string> = {};
                      resp.errors.forEach((it: any) => {
                        if (it.field && it.message) fieldErrs[it.field] = it.message;
                      });
                      if (Object.keys(fieldErrs).length > 0) {
                        setErrors(fieldErrs);
                        showToast("Please fix the highlighted errors before submitting");
                        return;
                      }
                    }
                    if (resp.field && resp.message) {
                      setFieldError(resp.field, resp.message);
                      showToast("Please fix the highlighted errors before submitting");
                      return;
                    }
                    showToast(extractMessage(e));
                    return;
                  } catch {
                    showToast("Failed to save user");
                    return;
                  }
                }
                showToast(e?.message ?? "Failed to save user");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ setFieldValue, dirty, values, submitForm, setTouched }) => (
              <Form className="flex flex-col min-h-0">
                {/* Scrollable body */}
                <div className="overflow-y-auto px-6 py-4 bg-slate-50 flex flex-col gap-4" style={{ maxHeight: "calc(90vh - 130px)" }}>
                  <BasicInformation editId={editId} />
                  <OrganizationSection
                    managers={managers}
                    departments={departments}
                    roles={roles}
                    setFieldValue={setFieldValue}
                    currentRoles={values.roles}
                    currentManagerId={values.managerId}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-100 bg-white rounded-b-2xl">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    {BUTTON_LABELS.CANCEL}
                  </button>
                  <button
                    type="button"
                    disabled={saving || (editId ? !dirty : false)}
                    onClick={() => {
                      try {
                        setTouched(makeAllTouched(values || {}));
                      } catch {
                        const touched: Record<string, boolean> = {};
                        Object.keys(values || {}).forEach((k) => (touched[k] = true));
                        setTouched(touched);
                      }
                      submitForm();
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Saving…
                      </>
                    ) : editId ? (
                      BUTTON_LABELS.SAVE
                    ) : (
                      BUTTON_LABELS.ADD
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {/* Toast */}
          {toast && (
            <div
              className={`absolute top-4 right-4 left-4 z-10 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
                }`}
            >
              <span className="flex-1">{toast.msg}</span>
              <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">✕</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDialog;
