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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow digits for phone number and max 10 chars
    let finalValue = value;
    if (name === "driverPhone") {
      finalValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (formData.cabOwner.trim().length < 3) {
      newErrors.cabOwner = "Must be at least 3 characters";
    }
    if (formData.driverName.trim().length < 3) {
      newErrors.driverName = "Must be at least 3 characters";
    }
    if (!/^\d{10}$/.test(formData.driverPhone.trim())) {
      newErrors.driverPhone = "Must be exactly 10 digits";
    }
    if (formData.cabRegistrationNumber.trim().length < 4) {
      newErrors.cabRegistrationNumber = "Must be at least 4 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const isAllFieldsFilled = 
    formData.cabOwner.trim() !== "" &&
    formData.driverName.trim() !== "" &&
    formData.driverPhone.trim() !== "" &&
    formData.cabRegistrationNumber.trim() !== "";

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
                error={!!errors.cabOwner}
                helperText={errors.cabOwner}
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
                error={!!errors.driverName}
                helperText={errors.driverName}
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
                error={!!errors.driverPhone}
                helperText={errors.driverPhone}
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
                error={!!errors.cabRegistrationNumber}
                helperText={errors.cabRegistrationNumber}
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
            disabled={isLoading || !isAllFieldsFilled} 
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
