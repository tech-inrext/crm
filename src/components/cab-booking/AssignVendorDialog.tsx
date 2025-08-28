import React, { useEffect, useState } from "react";
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
  AssignmentInd,
} from "@mui/material";

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

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/v0/employee/getAllEmployeeList")
      .then((res) => res.json())
      .then((data) => {
        const cabVendors = (data.data || []).filter(
          (emp: any) => emp.isCabVendor
        );
        setVendors(cabVendors);
      })
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign to Vendor</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {vendors.map((vendor) => (
              <ListItemButton
                key={vendor._id}
                selected={selectedVendor === vendor._id}
                onClick={() => setSelectedVendor(vendor._id)}
              >
                <ListItemText
                  primary={vendor.name}
                  secondary={vendor.email + " | " + vendor.phone}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
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
