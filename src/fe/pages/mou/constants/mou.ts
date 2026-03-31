// ─── API ──────────────────────────────────────────────────────────────────────
export const MOU_API_BASE = "/api/v0/employee";
export const MOU_APPROVE_URL = (id: string) =>
  `/api/v0/mou/approve-and-send/${id}`;
export const MOU_RESEND_URL = (id: string) => `/api/v0/mou/resend-mail/${id}`;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const MOU_PERMISSION_MODULE = "mou";
