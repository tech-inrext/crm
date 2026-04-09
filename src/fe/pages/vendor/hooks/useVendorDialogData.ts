"use client";

import { useEffect, useCallback } from "react";
import { useToast } from "@/fe/components/Toast/ToastContext";
import {
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from "@/fe/pages/vendor/vendorApi";
import { buildVendorPayload, extractMessage } from "@/fe/pages/vendor/utils";
import type { VendorFormData } from "@/fe/pages/vendor/types";

interface UseVendorDialogDataProps {
  editId: string | null;
  onSave: () => void;
}

export const useVendorDialogData = ({
  editId,
  onSave,
}: UseVendorDialogDataProps) => {
  const { showToast } = useToast();
  const createMutation = useCreateVendorMutation();
  const updateMutation = useUpdateVendorMutation();

  const {
    mutate,
    loading: saving,
    error,
  } = editId ? updateMutation : createMutation;

  // Handle external errors (from the mutation state)
  useEffect(() => {
    if (error) {
      showToast(extractMessage(error), "error");
    }
  }, [error, showToast]);

  const handleSubmit = useCallback(
    async (values: VendorFormData) => {
      try {
        const payload = buildVendorPayload(values, editId ? { id: editId } : {});
        await mutate(payload, onSave);
      } catch (e: any) {
        // Handle immediate errors or thrown exceptions
        showToast(extractMessage(e), "error");
      }
    },
    [editId, mutate, onSave, showToast],
  );

  return {
    handleSubmit,
    saving,
  };
};
