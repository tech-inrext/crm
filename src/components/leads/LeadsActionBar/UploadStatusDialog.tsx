// src/components/leads/LeadsActionBar/UploadStatusDialog.tsx
import React from "react";
import dynamic from "next/dynamic";

const CheckUploadStatusDialog = dynamic(
  () => import("@/components/leads/CheckUploadStatusDialog"),
  { ssr: false }
);

interface UploadStatusDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadStatusDialog: React.FC<UploadStatusDialogProps> = ({ open, onClose }) => {
  return <CheckUploadStatusDialog open={open} onClose={onClose} />;
};

export default UploadStatusDialog;