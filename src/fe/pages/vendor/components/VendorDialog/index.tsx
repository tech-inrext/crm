"use client";

import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import { BUTTON_LABELS } from "@/fe/pages/vendor/constants/vendors";
import {
  useVendorDialogData,
} from "@/fe/pages/vendor/hooks/useVendorDialogData";
import { makeAllTouched } from "@/fe/pages/vendor/utils";
import {
  vendorValidationSchema,
  vendorAddValidationSchema,
} from "./validation";
import {
  backdropSx,
  dialogPanelSx,
  closeIconButtonSx,
  submitButtonSx,
} from "./styles";
import BasicInformation from "./BasicInformation";
import type {
  VendorDialogProps,
  VendorFormData,
} from "@/fe/pages/vendor/types";
import {
  Button,
  CircularProgress,
  IconButton,
  CloseIcon,
} from "@/components/ui/Component";

const VendorDialog: React.FC<VendorDialogProps> = ({
  open,
  editId,
  initialData,
  onClose,
  onSave,
}) => {
  const { handleSubmit, saving } = useVendorDialogData({ editId, onSave });

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9999"
        style={backdropSx}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div className="fixed inset-0 z-10000 flex items-center justify-center pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col pointer-events-auto"
          style={dialogPanelSx}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[17px] font-semibold text-slate-800">
              {editId ? BUTTON_LABELS.EDIT_VENDOR : BUTTON_LABELS.ADD_VENDOR}
            </h2>
            <IconButton
              onClick={onClose}
              size="small"
              sx={closeIconButtonSx}
              aria-label="Close dialog"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
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
            {({ dirty, values, submitForm, setTouched }) => (
              <Form className="flex flex-col flex-1 min-h-0">
                <div
                  className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50 flex flex-col gap-4"
                  style={{ maxHeight: "calc(90vh - 130px)" }}
                >
                  <BasicInformation />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-100 bg-white rounded-b-2xl">
                  <Button
                    variant="text"
                    onClick={onClose}
                    disabled={saving}
                  >
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


export default VendorDialog;
