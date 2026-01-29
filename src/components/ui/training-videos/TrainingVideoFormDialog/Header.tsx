import React from "react";
import { DialogTitle, Box, Typography, Button } from "@mui/material";
import { Close } from "@mui/icons-material";

interface HeaderProps {
  title: string;
  onClose: () => void;
  isUploading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onClose,
  isUploading
}) => {
  return (
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Button 
          onClick={onClose} 
          disabled={isUploading} 
          sx={styles.closeButton}
        >
          <Close />
        </Button>
      </Box>
    </DialogTitle>
  );
};

const styles = {
  closeButton: {
    minWidth: 'auto',
    p: 1
  }
} as const;