import React from "react";

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
      className={`fixed top-4 right-4 z-[1400] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${colourClass}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
