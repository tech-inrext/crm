"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MOU_API_BASE, DEFAULT_PAGE_SIZE } from "@/fe/pages/mou/constants/mou";
import type { MouItem, MouView } from "@/fe/pages/mou/types";

export function useMouPage() {
  const { user } = useAuth();

  // ─── View toggle ──────────────────────────────────────────────────────────
  const [view, setView] = useState<MouView>("pending");
  const status = view === "pending" ? "Pending" : "Approved";

  // ─── List state ───────────────────────────────────────────────────────────
  const [items, setItems] = useState<MouItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  // ─── Snackbar ─────────────────────────────────────────────────────────────
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
    "success",
  );

  const showSnack = useCallback(
    (msg: string, severity: "success" | "error") => {
      setSnackMsg(msg);
      setSnackSeverity(severity);
      setSnackOpen(true);
    },
    [],
  );

  // ─── Load list ────────────────────────────────────────────────────────────
  const load = useCallback(
    async (p = page, limit = rowsPerPage, st = status) => {
      setLoading(true);
      try {
        let isSystemAdmin = false;
        if (user) {
          const cur = user.currentRole;
          if (cur && typeof cur !== "string") {
            isSystemAdmin = Boolean((cur as any).isSystemAdmin);
          } else if (Array.isArray(user.roles)) {
            const roleObj = user.roles.find((r: any) => r._id === cur);
            if (roleObj) isSystemAdmin = Boolean(roleObj.isSystemAdmin);
          }
        }

        const params: Record<string, any> = {
          page: p,
          limit,
          mouStatus: st || undefined,
          requireSlab: st === "Pending" ? true : undefined,
        };

        if (user && user._id && !isSystemAdmin) {
          params.managerId = user._id;
        }

        const resp = await axios.get(MOU_API_BASE, { params });
        const { data, pagination } = resp.data || {};
        setItems(data || []);
        setTotalItems(pagination?.totalItems || data?.length || 0);
      } catch {
        setItems([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [page, rowsPerPage, status, user],
  );

  // ─── Reload on pagination / view change ───────────────────────────────────
  useEffect(() => {
    load(page, rowsPerPage, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, status]);

  // ─── Reset page when view changes ─────────────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [view]);

  // ─── Mark status ──────────────────────────────────────────────────────────
  const markStatus = useCallback(
    async (id: string, newStatus: string) => {
      const resp = await axios.patch(`${MOU_API_BASE}/${id}`, {
        mouStatus: newStatus,
      });
      const updated = resp.data.data;
      if (newStatus !== status) {
        setItems((prev) => prev.filter((it) => it._id !== id));
      } else {
        setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      }
      return updated;
    },
    [status],
  );

  // ─── Action handlers ──────────────────────────────────────────────────────
  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await markStatus(id, "Approved");
        await axios.post(`/api/v0/mou/approve-and-send/${id}`);
        showSnack("MOU approved and email sent to associate", "success");
      } catch {
        await load(page, rowsPerPage, "Pending").catch(() => {});
        showSnack("Failed to approve MOU", "error");
      }
    },
    [markStatus, load, page, rowsPerPage, showSnack],
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await markStatus(id, "Rejected");
        await load(page, rowsPerPage, "Pending");
      } catch (e) {
        console.error(e);
      }
    },
    [markStatus, load, page, rowsPerPage],
  );

  const handleResend = useCallback(
    async (id: string) => {
      try {
        const resp = await axios.post(`/api/v0/mou/resend-mail/${id}`);
        if (resp.data?.success) showSnack("Mail has been sent", "success");
        else showSnack("Failed to send mail", "error");
      } catch {
        showSnack("Failed to send mail", "error");
      }
    },
    [showSnack],
  );

  const handleMarkComplete = useCallback(
    async (id: string) => {
      try {
        if (view === "pending") {
          await markStatus(id, "Completed");
          await load(page, rowsPerPage, "Pending");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [view, markStatus, load, page, rowsPerPage],
  );

  return {
    // List
    items,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,

    // View
    view,
    setView,

    // Actions
    handleApprove,
    handleReject,
    handleResend,
    handleMarkComplete,

    // Snackbar
    snackOpen,
    setSnackOpen,
    snackMsg,
    snackSeverity,
  } as const;
}

export default useMouPage;
