// src/components/ui/user-dialog/utils/formatters.ts
export const toDateInputString = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const formatPhoneValue = (value: string | null | undefined): string => {
  return value ?? "";
};

export const formatPanNumber = (value: string | null | undefined): string => {
  return (value ?? "").toUpperCase();
};