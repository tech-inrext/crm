// ================= CATEGORY COLORS =================
export const categoryColors: Record<string, string> = {
  "Urgent Alerts": "#f44336",
  "Project Updates": "#9c27b0",
  "Sales Targets": "#3f51b5",
  "Pricing / Offers": "#4caf50",
  "HR / Internal": "#ff9800",
  "General Announcements": "#1976d2",
};

// ================= PRIORITY COLORS =================
export const priorityColors: Record<string, string> = {
  Urgent: "#d32f2f",
  Important: "#ed6c02",
  Info: "#1976d2",
};

// ================= GRID STYLE =================
// 4 cards per row on large screens
export const gridStyles = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",                 // mobile
    sm: "repeat(2, 1fr)",     // tablet
    md: "repeat(3, 1fr)",     // small laptop
    lg: "repeat(4, 1fr)",     // desktop ✅
  },
  gap: 2,
  width: "100%",
  alignItems: "stretch",
};

// ================= QUERY BUILDER =================
type NoticeFilters = {
  searchText?: string;
  category?: string;
  priority?: string;
  date?: any; // supports string | dayjs | moment
};

export const buildNoticeQuery = (filters: NoticeFilters = {}) => {
  const query = new URLSearchParams();

  const { searchText, category, priority, date } = filters;

  // SEARCH
  if (searchText?.trim()) {
    query.append("search", searchText.trim());
  }

  // CATEGORY
  if (category && category !== "All") {
    query.append("category", category);
  }

  // PRIORITY
  if (priority && priority !== "All") {
    query.append("priority", priority);
  }

  // DATE
  if (date) {
    let formattedDate = "";

    if (typeof date === "string") {
      formattedDate = date;
    } else if (date?.format) {
      formattedDate = date.format("YYYY-MM-DD");
    }

    if (formattedDate) {
      query.append("date", formattedDate);
    }
  }

  return query.toString();
};
export const isImageFile = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString();

import dayjs, { Dayjs } from "dayjs";

// ---------------- FILE UTILITIES ----------------
export type PendingFile = { id: string; file: File; customName: string };

export const generatePendingFiles = (files: File[]): PendingFile[] =>
  files.map((f) => ({
    id: `${f.name}-${Date.now()}`,
    file: f,
    customName: f.name.replace(/\.[^.]+$/, ""),
  }));

export const uploadToS3 = async (file: File): Promise<string> => {
  const res = await fetch("/api/v0/s3/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  const data = await res.json();
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  return data.fileUrl;
};

// ---------------- NOTIFICATION ----------------
export type NotifyFn = (msg: string, type?: "error" | "success") => void;

export const notify = (setMsg: (msg: string) => void, setSeverity: (type: "error" | "success") => void, setOpen: (open: boolean) => void) =>
  (msg: string, type: "error" | "success" = "error") => {
    setMsg(msg);
    setSeverity(type);
    setOpen(true);
  };

// ---------------- DATE ----------------
export const formatDayjs = (date: Dayjs | null): string | null =>
  date ? dayjs(date).format("YYYY-MM-DD") : null;



