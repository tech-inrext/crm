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

export interface MouListProps {
  items: MouItem[];
  loading: boolean;
  onMarkComplete: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onResend?: (id: string) => Promise<void>;
  view?: "pending" | "completed";
}

export interface MouActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface MouCardProps {
  emp: MouItem;
  view?: "pending" | "completed";
  onApproveConfirm: (id: string) => void;
  onRejectConfirm: (id: string) => void;
  onPreview: (id: string) => void;
  onResend?: (id: string) => void;
}

export interface PreviewLoaderProps {
  id: string;
}