"use client";

import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";

type FilterType = {
  searchText: string;
  category: string;
  priority: string;
  date?: any;
};

export default function useNoticeBoardHeader(
  onFilterChange: (filters: FilterType) => void,
  tabData: any[],
) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [date, setDate] = useState<any>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  // ✅ FIX: prevent duplicate initial filter call
  const initializedRef = useRef(false);

  // =========================
  // Fetch Meta
  // =========================
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch("/api/v0/notice/meta");
        const data = await res.json();

        if (data.success) {
          setCategories(data.data.categories || []);
          setPriorities(data.data.priorities || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchMeta();
  }, []);

  // =========================
  // Normalize
  // =========================
  const normalize = (val: string) => {
    return val === "All" ? "" : val;
  };

  // =========================
  // Trigger Filter (FIXED: stable calls)
  // =========================
  const triggerFilter = (
    s = searchText,
    c = category,
    p = priority,
    d = date,
  ) => {
    onFilterChange({
      searchText: s,
      category: normalize(c),
      priority: normalize(p),
      date: d ? dayjs(d).format("YYYY-MM-DD") : "",
    });
  };

  // =========================
  // Initial Load → FIXED (no duplicate API recall)
  // =========================
  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    onFilterChange({
      searchText: "",
      category: "",
      priority: "",
      date: "",
    });
  }, [onFilterChange]);

  // =========================
  // Handlers
  // =========================
  const handleSearchChange = (e: any) => {
    const val = e.target.value;
    setSearchText(val);
    triggerFilter(val, category, priority, date);
  };

  const handleCategoryChange = (e: any) => {
    const val = e.target.value;
    setCategory(val);

    if (val === "All") {
      setTab(0);
    }

    triggerFilter(searchText, val, priority, date);
  };

  const handlePriorityChange = (e: any) => {
    const val = e.target.value;
    setPriority(val);
    triggerFilter(searchText, category, val, date);
  };

  const handleDateChange = (val: any) => {
    setDate(val);
    triggerFilter(searchText, category, priority, val);
  };

  const handleTabChange = (_: any, val: number) => {
    setTab(val);

    const tabValue = tabData[val].value;

    const map: any = {
      general: "General Announcements",
      project: "Project Updates",
      pricing: "Pricing / Offers",
      sales: "Sales Targets",
      urgent: "Urgent Alerts",
      hr: "HR / Internal",
    };

    const mapped = map[tabValue] || "All";
    setCategory(mapped);

    triggerFilter(searchText, mapped, priority, date);
  };

  return {
    tab,
    open,
    setOpen,
    searchText,
    category,
    priority,
    date,
    categories,
    priorities,
    handleSearchChange,
    handleCategoryChange,
    handlePriorityChange,
    handleDateChange,
    handleTabChange,
  };
}
