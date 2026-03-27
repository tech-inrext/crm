"use client";

import { useEffect, useState } from "react";
import { buildNoticeQuery } from "@/utils/noticeUtils";

export type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  pinned: boolean;
  createdAt: string;
  createdBy?: {
    name: string;
  };
};

export type Meta = {
  categories: string[];
  priorities: string[];
};

export default function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [meta, setMeta] = useState<Meta>({
    categories: [],
    priorities: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch Meta
  const fetchMeta = async () => {
    try {
      const res = await fetch("/api/v0/notice/meta");
      const data = await res.json();

      if (data.success) {
        setMeta(data.data);
      }
    } catch (error) {
      console.error("Meta Fetch Error:", error);
    }
  };

  // Fetch Notices
  const fetchNotices = async (filters: any = {}) => {
    try {
      setLoading(true);

      const query = buildNoticeQuery(filters);

      const url = `/api/v0/notice${query ? `?${query}` : ""}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setNotices(data.data);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error("Fetch Notice Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchNotices();
  }, []);

  const pinnedNotices = notices.filter((n) => n.pinned);
  const regularNotices = notices.filter((n) => !n.pinned);

  return {
    notices,
    meta,
    loading,
    fetchNotices,
    pinnedNotices,
    regularNotices,
  };
}