import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

interface Props {
  open: boolean;
  link: string;
  onClose: () => void;
}

const ShareBookingDialog: React.FC<Props> = ({ open, link, onClose }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: 1.5,
          boxShadow: 3,
          p: 1.5,
          minWidth: 200,
          maxWidth: 260,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" mb={1} fontSize={14}>
          Share Booking Link
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <TextField
            value={link}
            size="small"
            fullWidth
            InputProps={{ readOnly: true, style: { fontSize: 12 } }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{ fontSize: 12, minWidth: 40, px: 0.5 }}
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copy
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default ShareBookingDialog;
