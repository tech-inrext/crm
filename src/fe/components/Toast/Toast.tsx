import React from "react";
import { IconButton, CloseIcon } from "@/components/ui/Component";

export interface ToastProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ open, message, severity, onClose }) => {
  if (!open) return null;

  const colourClass =
    severity === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-[1400] flex items-center gap-3 px-5 py-2.5 rounded-xl shadow-xl text-sm font-medium transition-all ${colourClass}`}
    >
      <span>{message}</span>
      <IconButton
        onClick={onClose}
        size="small"
        color="inherit"
        className="ml-1 hover:bg-white/10 transition-colors"
        aria-label="close"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

export default Toast;
