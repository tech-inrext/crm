import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Avatar,
  ListItemAvatar,
  Typography,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentInd from "@mui/icons-material/AssignmentInd";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface AssignVendorDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (vendorId: string) => void;
}

const AssignVendorDialog: React.FC<AssignVendorDialogProps> = ({
  open,
  onClose,
  onAssign,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lastCount, setLastCount] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  // Fetch cab-vendor records from backend. Use debounced query to avoid
  // spamming the API while typing. Results are mapped to the local Vendor
  // shape; we prefer cabOwnerName/driverName and fall back to pickup/drop for
  // secondary info when email/phone are missing.
  useEffect(() => {
    if (!open) return;

    let active = true;
    const controller = new AbortController();

    const doFetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "50");
        if (query) params.set("search", query);

        // explicit credentials to ensure cookies are sent to protected API
        const res = await fetch(`/api/v0/cab-vendor?${params.toString()}`, {
          signal: controller.signal,
          credentials: "include",
        });
        const json = await res.json();
        const rows = Array.isArray(json.data) ? json.data : [];
        setLastCount(rows.length);
        setLastError(null);

        if (!active) return;

        const mapped: Vendor[] = rows.map((r: any) => ({
          _id: r._id,
          name: r.cabOwnerName || r.driverName || `Vendor ${r._id}`,
          email: (r.bookedBy && r.bookedBy.email) || r.email || "",
          phone:
            (r.bookedBy && r.bookedBy.phone) || r.phone || r.driverPhone || "",
        }));

        // If no cab-vendor rows returned, fall back to employee list that may
        // contain employees marked as cab vendors (older flow).
        if (mapped.length === 0) {
          try {
            const empRes = await fetch(`/api/v0/employee/getAllEmployeeList`, {
              signal: controller.signal,
              credentials: "include",
            });
            const empJson = await empRes.json();
            const empRows = Array.isArray(empJson.data) ? empJson.data : [];
            const cabEmps = empRows.filter((e: any) => e.isCabVendor);
            setLastCount(cabEmps.length);
            setLastError(null);
            const empMapped: Vendor[] = cabEmps.map((e: any) => ({
              _id: e._id,
              name: e.name || `Employee ${e._id}`,
              email: e.email || "",
              phone: e.phone || "",
            }));
            setVendors(empMapped);
            return;
          } catch (empErr) {
            console.error("Fallback employee fetch failed", empErr);
            setLastError(String(empErr?.message || empErr));
          }
        }

        setVendors(mapped);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load cab vendors", err);
        setLastError(String(err?.message || err));
        setVendors([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    // debounce 300ms
    const t = setTimeout(doFetch, 300);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(t);
    };
  }, [open, query]);

  const filtered = useMemo(() => {
    if (!query) return vendors;
    const q = query.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.phone || "").toLowerCase().includes(q)
    );
  }, [vendors, query]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentInd sx={{ color: "primary.main" }} />
          <Typography fontWeight={700}>Assign to Vendor</Typography>
        </Box>
        <Box>
          {lastCount !== null && (
            <Typography variant="caption" color="text.secondary">
              {lastCount} vendor(s) returned
            </Typography>
          )}
          {lastError && (
            <Typography variant="caption" color="error" display="block">
              {lastError}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            placeholder="Search vendor by name, email or phone"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <List disablePadding>
            {filtered.length === 0 ? (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">
                  No vendors found.
                </Typography>
              </Box>
            ) : (
              filtered.map((vendor) => (
                <React.Fragment key={vendor._id}>
                  <ListItemButton
                    selected={selectedVendor === vendor._id}
                    onClick={() => setSelectedVendor(vendor._id)}
                    sx={{ py: 1.25 }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 36, height: 36 }}
                      >
                        {vendor.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>{vendor.name}</Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {vendor.email}{" "}
                          {vendor.phone ? ` | ${vendor.phone}` : ""}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => selectedVendor && onAssign(selectedVendor)}
          disabled={!selectedVendor}
          variant="contained"
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignVendorDialog;
