import React from "react";
import { DialogActions, Button, CircularProgress } from "@mui/material";

interface FormActionsProps {
  isUploading: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isUploading,
  isEditing,
  onCancel,
  onSubmit
}) => {
  return (
    <DialogActions sx={{ p: 3 }}>
      <Button 
        onClick={onCancel} 
        disabled={isUploading}
        variant="outlined"
      >
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        disabled={isUploading}
        sx={{ minWidth: 100 }}
        startIcon={isUploading ? <CircularProgress size={20} /> : null}
      >
        {isUploading ? "Processing..." : isEditing ? "Update Video" : "Create Video"}
      </Button>
    </DialogActions>
  );
};