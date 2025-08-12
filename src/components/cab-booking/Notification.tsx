import React, { useEffect } from "react";

interface NotificationProps {
  error?: string;
  success?: string;
  onClear?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Notification: React.FC<NotificationProps> = ({
  error,
  success,
  onClear,
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  useEffect(() => {
    if (autoClose && (error || success) && onClear) {
      const timer = setTimeout(() => {
        onClear();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [error, success, autoClose, autoCloseDelay, onClear]);

  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          {onClear && (
            <button
              onClick={onClear}
              className="ml-2 text-red-500 hover:text-red-700 font-bold"
              aria-label="Close notification"
            >
              ×
            </button>
          )}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex justify-between items-center">
          <span>{success}</span>
          {onClear && (
            <button
              onClick={onClear}
              className="ml-2 text-green-500 hover:text-green-700 font-bold"
              aria-label="Close notification"
            >
              ×
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Notification;
