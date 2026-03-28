// Category Colors
export const categoryColors: Record<string, string> = {
  "Urgent Alerts": "#f44336",
  "Project Updates": "#9c27b0",
  "Sales Targets": "#3f51b5",
  "Pricing / Offers": "#4caf50",
  "HR / Internal": "#ff9800",
  "General Announcements": "#1976d2",
};

// Priority Colors
export const priorityColors: Record<string, string> = {
  Urgent: "#d32f2f",
  Important: "#ed6c02",
  Info: "#1976d2",
};

// Grid Style
export const gridStyles = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: 2,
};

// Build Query Params
export const buildNoticeQuery = (filters: any) => {
  const query = new URLSearchParams();

  if (filters?.searchText?.trim()) {
    query.append("search", filters.searchText);
  }

  if (filters?.category && filters.category !== "All") {
    query.append("category", filters.category);
  }

  if (filters?.priority && filters.priority !== "All") {
    query.append("priority", filters.priority);
  }

  if (filters?.date) {
    query.append(
      "date",
      filters.date?.format
        ? filters.date.format("YYYY-MM-DD")
        : filters.date
    );
  }

  return query.toString();
};