"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Component";
import { Formik, Form } from "formik";
import { BUTTON_LABELS } from "@/fe/pages/vendor/constants/vendors";
import {
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from "@/fe/pages/vendor/vendorApi";
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import { buildVendorPayload, extractMessage } from "@/fe/pages/vendor/utils";
import {
  vendorValidationSchema,
  vendorAddValidationSchema,
} from "./validation";
import BasicInformation from "./BasicInformation";
import type {
  VendorDialogProps,
  VendorFormData,
} from "@/fe/pages/vendor/types";
import { CircularProgress } from "@/components/ui/Component";

const VendorDialog: React.FC<VendorDialogProps> = ({
  open,
  editId,
  initialData,
  onClose,
  onSave,
}) => {
  const createMutation = useCreateVendorMutation();
  const updateMutation = useUpdateVendorMutation();

  const {
    mutate,
    loading: saving,
    error,
  } = editId ? updateMutation : createMutation;

  const [toast, setToast] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (error) {
      showToast(extractMessage(error));
    }
  }, [error]);

  if (!open) return null;

  const handleSubmit = async (values: VendorFormData) => {
    try {
      const payload = buildVendorPayload(values, editId ? { id: editId } : {});
      await mutate(payload, async () => {
        invalidateQueryCache("/api/v0/employee");
        await onSave();
      });
    } catch (e: any) {
      showToast(extractMessage(e));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9999"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div className="fixed inset-0 z-10000 flex items-center justify-center pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col pointer-events-auto"
          style={{ maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[17px] font-semibold text-slate-800">
              {editId ? BUTTON_LABELS.EDIT_VENDOR : BUTTON_LABELS.ADD_VENDOR}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
              aria-label="Close dialog"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <Formik
            initialValues={initialData}
            validationSchema={
              editId ? vendorValidationSchema : vendorAddValidationSchema
            }
            validateOnMount={false}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty }) => (
              <Form className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <BasicInformation />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={saving}
                    className="font-semibold"
                  >
                    {BUTTON_LABELS.CANCEL}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || !isValid || !dirty}
                    sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
                  >
                    {saving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : editId ? (
                      BUTTON_LABELS.SAVE
                    ) : (
                      BUTTON_LABELS.ADD
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          {/* Inline toast */}
          {toast && (
            <div
              className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg text-white ${
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {toast.msg}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VendorDialog;
