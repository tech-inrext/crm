import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { Lead } from "../../app/dashboard/Leads";

interface LeadDialogProps {
  open: boolean;
  editId: string | null;
  form: Omit<Lead, "id" | "_id">;
  saving: boolean;
  onChange: (field: keyof Omit<Lead, "id" | "_id">, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const LeadDialog: React.FC<LeadDialogProps> = ({
  open,
  editId,
  form,
  saving,
  onChange,
  onClose,
  onSave,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    aria-labelledby="lead-dialog-title"
  >
    <DialogTitle
      id="lead-dialog-title"
      sx={{ fontWeight: 700, color: "#1976d2", fontSize: 20 }}
    >
      {editId ? "Edit Lead" : "Add Lead"}
    </DialogTitle>
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 1,
        bgcolor: "#f5f7fa",
        borderRadius: 2,
      }}
    >
      <TextField
        label="Company"
        value={form.name}
        onChange={(e) => onChange("name", e.target.value)}
        required
        autoFocus
        inputProps={{ "aria-label": "Lead company" }}
        sx={{ bgcolor: "#fff", borderRadius: 1 }}
      />
      <TextField
        label="Contact"
        value={form.contact}
        onChange={(e) => onChange("contact", e.target.value)}
        required
        inputProps={{ "aria-label": "Lead contact" }}
        sx={{ bgcolor: "#fff", borderRadius: 1 }}
      />
      <TextField
        label="Email"
        value={form.email}
        onChange={(e) => onChange("email", e.target.value)}
        required
        type="email"
        inputProps={{ "aria-label": "Lead email" }}
        sx={{ bgcolor: "#fff", borderRadius: 1 }}
      />
      <TextField
        label="Phone"
        value={form.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        required
        inputProps={{ "aria-label": "Lead phone" }}
        sx={{ bgcolor: "#fff", borderRadius: 1 }}
      />
      <TextField
        label="Status"
        value={form.status}
        onChange={(e) => onChange("status", e.target.value)}
        required
        inputProps={{ "aria-label": "Lead status" }}
        sx={{ bgcolor: "#fff", borderRadius: 1 }}
      />
      <TextField
        label="Value"
        value={form.value}
        onChange={(e) => onChange("value", e.target.value)}
        required
        inputProps={{ "aria-label": "Lead value" }}
        sx={{ bgcolor: "#fff", borderRadius: 1 }}
      />
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} disabled={saving} sx={{ fontWeight: 600 }}>
        Cancel
      </Button>
      <Button
        onClick={onSave}
        variant="contained"
        disabled={saving}
        sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
      >
        {saving ? <CircularProgress size={20} /> : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default LeadDialog;
