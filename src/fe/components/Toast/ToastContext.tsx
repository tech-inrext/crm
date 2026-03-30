"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast from "./Toast";

type ToastSeverity = "success" | "error";

interface ToastContextType {
  showToast: (message: string, severity?: ToastSeverity) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<ToastSeverity>("success");

  const showToast = useCallback((msg: string, sev: ToastSeverity = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        open={open}
        message={message}
        severity={severity}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
