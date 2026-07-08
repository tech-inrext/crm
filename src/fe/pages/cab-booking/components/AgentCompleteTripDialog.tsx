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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpeedIcon from "@mui/icons-material/Speed";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import MODULE_STYLES from "@/styles/moduleStyles";

interface AgentCompleteTripDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { startKm: string; endKm: string; odometerStartFile: File | null; odometerEndFile: File | null }) => void;
  isLoading: boolean;
}

const AgentCompleteTripDialog: React.FC<AgentCompleteTripDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    startKm: "",
    endKm: "",
  });
  const [odometerStartFile, setOdometerStartFile] = useState<File | null>(null);
  const [odometerEndFile, setOdometerEndFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const file = e.target.files?.[0] || null;
    if (type === "start") setOdometerStartFile(file);
    else setOdometerEndFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      odometerStartFile,
      odometerEndFile,
    });
  };

  const totalKm = (Number(formData.endKm) || 0) - (Number(formData.startKm) || 0);

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
          <ReceiptIcon />
          Complete Trip Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fafafa" }}>
          <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "grey.100" }}>
            <Typography variant="body1" color="text.secondary" mb={3} sx={{ fontWeight: 500 }}>
              Finalize the trip by entering the final odometer readings.
            </Typography>
            <Box display="grid" gap={3}>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  fullWidth
                  label="Start Km"
                  name="startKm"
                  type="number"
                  value={formData.startKm}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SpeedIcon color="action" fontSize="small" /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth
                  label="End Km"
                  name="endKm"
                  type="number"
                  value={formData.endKm}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SpeedIcon color="action" fontSize="small" /></InputAdornment>,
                  }}
                />
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "primary.50", p: 1.5, borderRadius: 2 }}>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  Total Distance Computed:
                </Typography>
                <Typography variant="subtitle1" color="primary.dark" fontWeight={700}>
                  {Math.max(totalKm, 0)} Km
                </Typography>
              </Box>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="subtitle2" mb={1} color="text.primary" fontWeight={600}>
                    Start Odometer Photo
                  </Typography>
                  <Button
                    component="label"
                    sx={{
                      width: "100%",
                      height: 100,
                      border: "2px dashed",
                      borderColor: odometerStartFile ? "success.main" : "grey.300",
                      bgcolor: odometerStartFile ? "success.50" : "grey.50",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { bgcolor: odometerStartFile ? "success.100" : "grey.100" }
                    }}
                  >
                    {odometerStartFile ? <CheckCircleIcon color="success" /> : <InsertPhotoIcon color="action" />}
                    <Typography variant="body2" color={odometerStartFile ? "success.main" : "text.secondary"} fontWeight={500} sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", px: 2 }}>
                      {odometerStartFile ? odometerStartFile.name : "Click to browse"}
                    </Typography>
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "start")} />
                  </Button>
                </Box>

                <Box>
                  <Typography variant="subtitle2" mb={1} color="text.primary" fontWeight={600}>
                    End Odometer Photo
                  </Typography>
                  <Button
                    component="label"
                    sx={{
                      width: "100%",
                      height: 100,
                      border: "2px dashed",
                      borderColor: odometerEndFile ? "success.main" : "grey.300",
                      bgcolor: odometerEndFile ? "success.50" : "grey.50",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { bgcolor: odometerEndFile ? "success.100" : "grey.100" }
                    }}
                  >
                    {odometerEndFile ? <CheckCircleIcon color="success" /> : <InsertPhotoIcon color="action" />}
                    <Typography variant="body2" color={odometerEndFile ? "success.main" : "text.secondary"} fontWeight={500} sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", px: 2 }}>
                      {odometerEndFile ? odometerEndFile.name : "Click to browse"}
                    </Typography>
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "end")} />
                  </Button>
                </Box>
              </Box>

            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8fafc", borderTop: "1px solid", borderColor: "grey.200" }}>
          <Button 
            onClick={onClose} 
            disabled={isLoading} 
            sx={{ color: "grey.600", "&:hover": { bgcolor: "grey.100" }, fontWeight: 600, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            variant="contained" 
            sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, fontWeight: 600, px: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
            {isLoading ? "Submitting..." : "Complete Trip"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AgentCompleteTripDialog;
