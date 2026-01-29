import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  LocalizationProvider,
  AdapterDateFns,
  DateTimePicker,
  Box,
  Stack,
  CircularProgress,
  IconButton,
  CloseIcon,
  LocationOn,
  DirectionsCar,
  Event,
  InputAdornment,
  Collapse,
  Paper,
  Divider,
} from "@/components/ui/Component";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface SiteVisitDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  initialClientName?: string;
  initialProject?: string;
  clientPhone?: string;
  onSaved?: () => void;
}

const SiteVisitDialog: React.FC<SiteVisitDialogProps> = ({
  open,
  onClose,
  leadId,
  initialClientName = "",
  initialProject = "",
  clientPhone = "",
  onSaved,
}) => {
  // Form State
  const [project, setProject] = useState(initialProject);
  const [requestedDate, setRequestedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");

  const displayName = initialClientName || clientPhone || "Client";

  // Cab State
  const [cabRequired, setCabRequired] = useState(false);
  const [numberOfClients, setNumberOfClients] = useState<string>("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset/Initialize form when opening or props change
  useEffect(() => {
    if (open) {
      setProject(initialProject || "");
      setRequestedDate(null);
      setNotes("");
      setCabRequired(false);
      setNumberOfClients("");
      setPickupPoint("");
      setDropPoint("");
      setError(null);
    }
  }, [open, initialProject]);

  const handleSubmit = async () => {
    // Basic Validation
    if (!requestedDate) return setError("Requested Date & Time is required");

    // Cab Validation
    if (cabRequired) {
      if (!project.trim())
        return setError("Project name is required for cab booking");
      if (!numberOfClients || parseInt(numberOfClients) < 1)
        return setError("Valid number of clients is required");
      if (!pickupPoint.trim()) return setError("Pickup point is required");
      if (!dropPoint.trim()) return setError("Drop point is required");
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        leadId,
        project: cabRequired ? project : undefined,
        clientName: displayName, // Use name or phone as client identifier
        requestedDateTime: requestedDate,
        notes,
        cabRequired,
        // Optional fields
        numberOfClients: cabRequired ? parseInt(numberOfClients) : undefined,
        pickupPoint: cabRequired ? pickupPoint : undefined,
        dropPoint: cabRequired ? dropPoint : undefined,
      };

      await axios.post(`/api/v0/lead/site-visit`, payload, {
        withCredentials: true,
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error("Failed to submit site visit", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to submit request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!requestedDate) return false;
    if (cabRequired) {
      if (!project.trim()) return false;
      if (!numberOfClients || parseInt(numberOfClients) < 1) return false;
      if (!pickupPoint.trim() || !dropPoint.trim()) return false;
    }
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #f3f4f6",
          bgcolor: "#fff",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 0.75,
              bgcolor: "primary.50",
              borderRadius: "10px",
              color: "primary.main",
              display: "flex",
            }}
          >
            <LocationOn fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                color: "gray.900",
                fontSize: "1.05rem",
              }}
            >
              Schedule Site Visit
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mt: 0.25,
                display: "block",
                fontWeight: 400,
              }}
            >
              Scheduling visit for{" "}
              <span style={{ fontWeight: 500, color: "#111827" }}>
                {displayName}
              </span>
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: "gray.400" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#f8fafc", overflowX: "hidden" }}>
        <Stack spacing={0} sx={{ width: "100%" }}>
          {error && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#fef2f2",
                borderBottom: "1px solid #fee2e2",
              }}
            >
              <Typography
                color="error"
                variant="body2"
                sx={{ fontWeight: 500, fontSize: "0.85rem" }}
              >
                {error}
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
              }}
            >
              Visit Information
            </Typography>

            <Stack spacing={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Requested Date & Time *"
                  value={requestedDate}
                  onChange={(newValue) => setRequestedDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      InputProps: {
                        sx: { borderRadius: "8px", minHeight: 36 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <Event fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <TextField
                label="Notes / Remarks"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                size="small"
                placeholder="Purpose of visit, special instructions, client availability…"
                InputProps={{
                  sx: { borderRadius: "8px" },
                }}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Transportation Section */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: cabRequired ? "#fff" : "#f8fafc",
              transition: "all 0.3s",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={cabRequired}
                  onChange={(e) => setCabRequired(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="subtitle2"
                      fontWeight={500}
                      color="gray.800"
                    >
                      Require Cab for Site Visit?
                    </Typography>
                    <DirectionsCar
                      sx={{ fontSize: 18, color: "text.secondary" }}
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    Enable if transportation needs to be arranged for this visit
                  </Typography>
                </Box>
              }
              sx={{ ml: 0, alignItems: "flex-start", width: "100%" }}
            />

            <Collapse in={cabRequired}>
              <Paper
                variant="outlined"
                sx={{
                  mt: 1.5,
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  borderRadius: "10px",
                  boxShadow: "none",
                }}
              >
                <Stack spacing={1.5}>
                  <TextField
                    label="Project Name *"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g. Green Valley Phase 1"
                    InputProps={{
                      sx: {
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        minHeight: 36,
                      },
                    }}
                  />
                  <TextField
                    label="Number of Clients *"
                    type="number"
                    value={numberOfClients}
                    onChange={(e) => setNumberOfClients(e.target.value)}
                    fullWidth
                    size="small"
                    inputProps={{ min: 1 }}
                    InputProps={{
                      sx: {
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        minHeight: 36,
                      },
                    }}
                  />

                  <TextField
                    label="Pickup Point *"
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Office / Home / Landmark"
                    InputProps={{
                      sx: {
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        minHeight: 36,
                      },
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Drop Point *"
                    value={dropPoint}
                    onChange={(e) => setDropPoint(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Drop location"
                    InputProps={{
                      sx: {
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        minHeight: 36,
                      },
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Paper>
            </Collapse>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid #f3f4f6",
          bgcolor: "#fff",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          variant="outlined"
          sx={{
            color: "text.secondary",
            borderColor: "gray.300",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 2.5,
            py: 0.6,
            fontSize: "0.85rem",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !isFormValid()}
          sx={{
            px: 3.5,
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "none",
            py: 0.7,
            fontSize: "0.85rem",
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Schedule Visit"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteVisitDialog;
