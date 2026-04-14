"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { DEFAULT_PAGE_SIZE } from "@/fe/pages/mou/constants/mou";
import type { MouView } from "@/fe/pages/mou/types";
import { isSystemAdmin as checkIsSystemAdmin } from "../utils";
import {
  useGetMousQuery,
  useUpdateMouMutation,
  useApproveAndSendMutation,
  useResendMailMutation,
} from "../mouApi";
import { invalidateQueryCache } from "@/fe/framework/hooks/createApi";
import { useToast } from "@/fe/components/Toast/ToastContext";

export function useMouPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // ─── View toggle ──────────────────────────────────────────────────────────
  const [view, setView] = useState<MouView>("pending");
  const status = view === "pending" ? "Pending" : "Approved";

  // ─── Pagination & Search State ─────────────────────────────────────────────
  const [currentPage, setLocalPage] = useState(1);
  const [pageSize, setLocalPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // ─── Data Query ───────────────────────────────────────────────────────────
  const isSystemAdmin = checkIsSystemAdmin(user);
  
  const {
    items,
    loading,
    totalItems,
    refetch,
    setPage: setApiPage,
    setPageSize: setApiPageSize,
  } = useGetMousQuery({
    mouStatus: status,
    requireSlab: status === "Pending" ? true : undefined,
    managerId: (user?._id && !isSystemAdmin) ? user._id : undefined,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
  });

  // ─── Tab Counts ───────────────────────────────────────────────────────────
  const { totalItems: pendingCount } = useGetMousQuery({
    mouStatus: "Pending",
    requireSlab: true,
    managerId: (user?._id && !isSystemAdmin) ? user._id : undefined,
    page: 1,
    limit: 1,
  });

  const { totalItems: completedCount } = useGetMousQuery({
    mouStatus: "Approved",
    managerId: (user?._id && !isSystemAdmin) ? user._id : undefined,
    page: 1,
    limit: 1,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const { mutate: updateMou } = useUpdateMouMutation();
  const { mutate: approveAndSend } = useApproveAndSendMutation();
  const { mutate: resendMail } = useResendMailMutation();

  // Sync internal API state with local state
  useEffect(() => {
    setApiPage(currentPage);
  }, [currentPage, setApiPage]);

  useEffect(() => {
    setApiPageSize(pageSize);
  }, [pageSize, setApiPageSize]);

  // Reset page when view or search changes
  useEffect(() => {
    setLocalPage(1);
  }, [view, debouncedSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  // ─── Action handlers ──────────────────────────────────────────────────────
  
  const handleApprove = useCallback(
    async (id: string) => {
      try {
        // 1. Mark as Approved
        await updateMou({ id, mouStatus: "Approved" });
        // 2. Trigger approve-and-send
        await approveAndSend({ id });
        
        invalidateQueryCache("/api/v0/employee");
        await refetch();
        showToast("MOU approved and email sent to associate", "success");
      } catch (err) {
        showToast("Failed to approve MOU", "error");
      }
    },
    [updateMou, approveAndSend, refetch, showToast],
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await updateMou({ id, mouStatus: "Rejected" });
        invalidateQueryCache("/api/v0/employee");
        await refetch();
        showToast("MOU rejected successfully", "success");
      } catch (err) {
        showToast("Failed to reject MOU", "error");
      }
    },
    [updateMou, refetch, showToast],
  );

  const handleResend = useCallback(
    async (id: string) => {
      try {
        await resendMail({ id });
        showToast("Mail has been sent", "success");
      } catch (err) {
        showToast("Failed to send mail", "error");
      }
    },
    [resendMail, showToast],
  );

  const handleMarkComplete = useCallback(
    async (id: string) => {
      try {
        if (view === "pending") {
          await updateMou({ id, mouStatus: "Completed" });
          invalidateQueryCache("/api/v0/employee");
          await refetch();
          showToast("MOU marked as completed", "success");
        }
      } catch (err) {
        showToast("Failed to mark MOU as completed", "error");
      }
    },
    [view, updateMou, refetch, showToast],
  );

  return {
    // List
    items,
    loading,
    page: currentPage,
    setPage: setLocalPage,
    rowsPerPage: pageSize,
    setRowsPerPage: setLocalPageSize,
    totalItems,
    // View
    view,
    setView,

    // Actions
    handleApprove,
    handleReject,
    handleResend,
    handleMarkComplete,

    // Search
    search,
    handleSearchChange,

    // Counts for tabs
    pendingCount: pendingCount || 0,
    completedCount: completedCount || 0,

    snackOpen: false, 
    setSnackOpen: () => {},
    snackMsg: "",
    snackSeverity: "success" as const,
  } as const;
}

/**
 * Hook to manage UI action states for the MouList (Confirmation Dialogs, Previews).
 */
export function useMouListActions(
  onApprove?: (id: string) => Promise<void>,
  onReject?: (id: string) => Promise<void>,
) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    id: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const openConfirm = (type: "approve" | "reject", id: string) => {
    setPendingAction({ type, id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { type, id } = pendingAction;
    setConfirmOpen(false);
    try {
      if (type === "approve" && onApprove) await onApprove(id);
      if (type === "reject" && onReject) await onReject(id);
    } catch (e) {
      // Error handling is typically done in the provided callback
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const openPreview = (id: string) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  return {
    confirmOpen,
    pendingAction,
    previewOpen,
    previewId,
    openConfirm,
    handleConfirm,
    handleCancel,
    openPreview,
    closePreview,
  };
}

export default useMouPage;
