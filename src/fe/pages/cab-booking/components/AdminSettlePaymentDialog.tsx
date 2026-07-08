import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
} from "@/components/ui/Component";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import MODULE_STYLES from "@/styles/moduleStyles";

interface AdminSettlePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { fare: string }) => void;
  isLoading: boolean;
}

const AdminSettlePaymentDialog: React.FC<AdminSettlePaymentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [fare, setFare] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ fare });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            background: MODULE_STYLES.visual.gradients.tableHeader,
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <MonetizationOnIcon />
          Settle Payment
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fafafa" }}>
          <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "grey.100" }}>
            <Typography variant="body1" color="text.secondary" mb={3} sx={{ fontWeight: 500 }}>
              Please enter the total fare collected for this trip to finalize the booking and mark the payment as settled.
            </Typography>
            <TextField
              fullWidth
              label="Total Fare Collected"
              name="fare"
              type="number"
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon color="action" fontSize="small" /></InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid", borderColor: "grey.200" }}>
          <Button 
            onClick={onClose} 
            disabled={isLoading} 
            sx={{ color: "grey.600", "&:hover": { bgcolor: "grey.100" }, fontWeight: 600, px: 3, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            variant="contained" 
            sx={{ bgcolor: "warning.main", color: "white", "&:hover": { bgcolor: "warning.dark" }, fontWeight: 600, px: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textTransform: "none" }}
          >
            {isLoading ? "Settling..." : "Settle Payment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminSettlePaymentDialog;
