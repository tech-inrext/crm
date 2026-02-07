// src/components/leads/utils/dateUtils.ts
export const formatDateForDisplay = (date: Date | null) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};