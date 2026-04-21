"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { buildNoticeQuery } from "@/fe/pages/Notice/utils/noticeUtils";

export default function useNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const requestInProgress = useRef(false);

  const getAllNotice = useCallback(async (filters: any = {}, force = false) => {
    const query = buildNoticeQuery(filters);

    // ✅ only block parallel requests (NOT same query blocking)
    if (requestInProgress.current && !force) return;

    requestInProgress.current = true;
    setLoading(true);

    try {
      const res = await fetch(`/api/v0/notice${query ? `?${query}` : ""}`);
      const data = await res.json();

      setNotices(data?.success ? data.data || [] : []);
    } catch (err) {
      console.error("getAllNotice error:", err);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, []);

  // initial load
  useEffect(() => {
    getAllNotice({}, true);
  }, [getAllNotice]);

  // ✅ instant UI add
  const addNoticeLocal = useCallback((notice: any) => {
    setNotices((prev) => [notice, ...prev]);
  }, []);

  // ✅ instant UI update
  const updateNoticeLocal = (updated: any) => {
    setNotices((prev) =>
      prev.map((item) =>
        item._id === updated._id ? { ...item, ...updated } : item,
      ),
    );
  };

  // ✅ instant delete
  const deleteNoticeLocal = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n._id !== id));
  }, []);

  const pinnedNotices = useMemo(
    () => notices.filter((n: any) => n.pinned),
    [notices],
  );

  const regularNotices = useMemo(
    () => notices.filter((n: any) => !n.pinned),
    [notices],
  );

  return {
    notices,
    loading,
    getAllNotice,
    pinnedNotices,
    regularNotices,
    addNoticeLocal,
    updateNoticeLocal,
    deleteNoticeLocal,
  };
}
