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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import NumbersIcon from "@mui/icons-material/Numbers";
import MODULE_STYLES from "@/styles/moduleStyles";

interface AdminAssignCabDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { cabOwner: string; driverName: string; driverPhone: string; cabRegistrationNumber: string }) => void;
  isLoading: boolean;
}

const AdminAssignCabDialog: React.FC<AdminAssignCabDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    cabOwner: "",
    driverName: "",
    driverPhone: "",
    cabRegistrationNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          <DirectionsCarIcon />
          Assign Cab Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fafafa" }}>
          <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "grey.100" }}>
            <Typography variant="body1" color="text.secondary" mb={4} sx={{ fontWeight: 500 }}>
              Please provide the cab and driver details for this booking. Once assigned, the booking will become active and the agent will be notified.
            </Typography>
            <Box display="grid" gap={3}>
              <TextField
                fullWidth
                label="Cab Owner Name"
                name="cabOwner"
                value={formData.cabOwner}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Driver Name"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BadgeIcon color="action" fontSize="small" /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Driver Contact Number"
                name="driverPhone"
                value={formData.driverPhone}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon color="action" fontSize="small" /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Cab Registration Number"
                name="cabRegistrationNumber"
                value={formData.cabRegistrationNumber}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><NumbersIcon color="action" fontSize="small" /></InputAdornment>,
                }}
              />
            </Box>
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
            sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, fontWeight: 600, px: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textTransform: "none" }}
          >
            {isLoading ? "Assigning..." : "Assign Cab"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminAssignCabDialog;
