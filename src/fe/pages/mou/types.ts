// ─── Domain models ────────────────────────────────────────────────────────────

export type MouStatus = "Pending" | "Approved" | "Rejected" | "Completed";
export type MouView = "pending" | "completed";

export interface MouItem {
  _id: string;
  name: string;
  email: string;
  designation?: string;
  mouStatus?: MouStatus | string;
  slabPercentage?: number;
  [key: string]: any;
}

// ─── UI types ─────────────────────────────────────────────────────────────────

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}
