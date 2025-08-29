// Copied from UsersActionBar.tsx, replaced 'user' with 'vendor'
// ...existing code...
// Copied from UsersActionBar.tsx, replaced 'user' with 'vendor'
// ...existing code...
import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import SearchBar from "@/components/ui/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import { addVendor } from "@/services/vendor.service";
import {
  VENDORS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/constants/vendors";

interface VendorsActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

const VendorsActionBar: React.FC<VendorsActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gender: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await addVendor(form);
      if (res && res.success) {
        if (onAdd) onAdd();
        handleClose();
        setForm({ name: "", phone: "", email: "", address: "", gender: "" });
      } else {
        setError(
          res?.message || "Failed to add vendor. Please check your input."
        );
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Unexpected error. Please try again later.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 3 },
        alignItems: { xs: "stretch", md: "center" },
        mb: { xs: 1, md: 2 },
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "auto" }, flex: 1 }}>
        <SearchBar
          sx={{ width: "100%", minWidth: 280 }}
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>
      {!isMobile && (
        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpen}
            disabled={saving || loading}
            size="large"
            sx={{
              minWidth: { xs: "auto", sm: 150 },
              height: { xs: 44, sm: 40 },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add Vendor"
            )}
          </Button>
        </PermissionGuard>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Vendor</DialogTitle>
        <DialogContent>
          {error && (
            <Box mb={2} color="error.main">
              {error}
            </Box>
          )}
          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            label="Phone"
            name="phone"
            fullWidth
            value={form.phone}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            fullWidth
            value={form.address}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            label="Gender"
            name="gender"
            fullWidth
            value={form.gender}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={20} color="inherit" /> : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorsActionBar;
