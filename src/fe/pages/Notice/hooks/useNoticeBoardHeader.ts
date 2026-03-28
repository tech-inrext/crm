"use client";

import { useEffect, useState } from "react";
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
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState<any>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  // =========================
  // Fetch Meta
  // =========================
  const fetchMeta = async () => {
    try {
      const res = await fetch("/api/v0/notice/meta");
      const data = await res.json();

      if (data.success) {
        setCategories(data.data.categories || []);
        setPriorities(data.data.priorities || []);
      }
    } catch (error) {
      console.log("Meta fetch error", error);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  // =========================
  // Trigger Filter
  // =========================
  const triggerFilter = (
    newSearch = searchText,
    newCategory = category,
    newPriority = priority,
    newDate = date,
  ) => {
    onFilterChange({
      searchText: newSearch,
      category: newCategory,
      priority: newPriority,
      date: newDate ? dayjs(newDate).format("YYYY-MM-DD") : "",
    });
  };

  // =========================
  // Search
  // =========================
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    triggerFilter(value, category, priority, date);
  };

  // =========================
  // Category
  // =========================
  const handleCategoryChange = (e: any) => {
    const value = e.target.value;
    setCategory(value);

    const reverseMap: any = {
      "General Announcements": 1,
      "Project Updates": 2,
      "Pricing / Offers": 3,
      "Sales Targets": 4,
      "Urgent Alerts": 5,
      "HR / Internal": 6,
    };

    setTab(reverseMap[value] || 0);

    triggerFilter(searchText, value, priority, date);
  };

  // =========================
  // Priority
  // =========================
  const handlePriorityChange = (e: any) => {
    const value = e.target.value;
    setPriority(value);
    triggerFilter(searchText, category, value, date);
  };

  // =========================
  // Date
  // =========================
  const handleDateChange = (newValue: any) => {
    setDate(newValue);
    triggerFilter(searchText, category, priority, newValue);
  };

  // =========================
  // Tabs
  // =========================
  const handleTabChange = (_: any, value: number) => {
    setTab(value);

    const tabValue = tabData[value].value;

    const categoryMap: any = {
      general: "General Announcements",
      project: "Project Updates",
      pricing: "Pricing / Offers",
      sales: "Sales Targets",
      urgent: "Urgent Alerts",
      hr: "HR / Internal",
    };

    const mappedCategory = categoryMap[tabValue] || "";

    setCategory(mappedCategory);

    triggerFilter(searchText, mappedCategory, priority, date);
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