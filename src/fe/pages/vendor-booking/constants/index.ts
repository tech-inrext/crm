export const VENDOR_BOOKING_API_BASE =
  "/api/v0/cab-vendor/getAllBookingForVendor";
export const CAB_BOOKING_PATCH_BASE = "/api/v0/cab-booking";
export const VENDOR_BOOKING_DEFAULT_PAGE_SIZE = 6;
export const SEARCH_PLACEHOLDER = "Search by client or location...";
export const SEARCH_DEBOUNCE_DELAY = 500;

export const BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "active",
  "completed",
  "cancelled",
  "payment_due",
] as const;

export { invalidateQueryCache } from "@/fe/framework/hooks/createApi";
