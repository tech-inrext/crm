import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Button,
  CloseIcon,
  RefreshIcon,
} from "@/components/ui/Component";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import { useToast } from "@/fe/components/Toast/ToastContext";

interface ClientFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  followUpId: string | null;
}

const ClientFeedbackDialog: React.FC<ClientFeedbackDialogProps> = ({ open, onClose, followUpId }) => {
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchFeedback = () => {
    if (!followUpId) return;
    setFeedbackData(null);
    setFeedbackError(null);
    setFeedbackLoading(true);
    axios.get(`/api/v0/lead/feedback-submission`, {
      params: { followUpId },
      withCredentials: true,
    })
    .then(res => setFeedbackData(res.data))
    .catch((err: any) => setFeedbackError(err?.response?.data?.message || "Failed to load feedback."))
    .finally(() => setFeedbackLoading(false));
  };

  useEffect(() => {
    if (open) {
      fetchFeedback();
    }
  }, [open, followUpId]);

  const handleResendFeedback = async (channel: "whatsapp" | "email") => {
    if (!followUpId) return;
    try {
      await axios.post("/api/v0/lead/feedback-submission", {
        followUpId,
        channel,
      }, { withCredentials: true });
      showToast(`Feedback sent via ${channel} successfully.`, "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || `Failed to send via ${channel}.`, "error");
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed", inset: 0, zIndex: 1400,
        bgcolor: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", p: 2,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bgcolor: "#fff", borderRadius: 4, maxWidth: 500, width: "100%",
          maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}>Client Feedback</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Submitted via mForm</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={fetchFeedback} disabled={feedbackLoading} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
              <RefreshIcon fontSize="small" sx={{ 
                animation: feedbackLoading ? "spin 1s linear infinite" : "none", 
                "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } 
              }} />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Body */}
        <Box sx={{ overflowY: "auto", flex: 1, p: 3 }}>
          {feedbackLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          )}
          {feedbackError && (
            <Box sx={{ p: 2, bgcolor: "#fef2f2", borderRadius: 2, border: "1px solid #fecaca" }}>
              <Typography variant="body2" color="error">{feedbackError}</Typography>
            </Box>
          )}
          {!feedbackLoading && !feedbackError && feedbackData && (
            <>
              {feedbackData.submission ? (
                <>
                  {/* Header Actions Area */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    {/* Status Badge */}
                    <Box sx={{
                      px: 1.5, py: 0.5, borderRadius: 99, display: "inline-flex", alignItems: "center",
                      bgcolor: "#dcfce7", border: "1px solid", borderColor: "#86efac",
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#15803d" }}>
                        ✓ Feedback Received
                      </Typography>
                    </Box>
                  </Box>

                  {/* Submitter info */}
                  <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.65rem" }}>Respondent</Typography>
                  <Box sx={{ mt: 0.75, mb: 2.5, p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <Stack direction="row" spacing={3}>
                      <Box><Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>NAME</Typography><Typography variant="body2" fontWeight={700}>{feedbackData.submission.submittedBy?.name || "—"}</Typography></Box>
                      <Box><Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>PHONE</Typography><Typography variant="body2" fontWeight={700}>{feedbackData.submission.submittedBy?.phone || "—"}</Typography></Box>
                      <Box><Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>EMAIL</Typography><Typography variant="body2" fontWeight={700}>{feedbackData.submission.submittedBy?.email || "—"}</Typography></Box>
                    </Stack>
                  </Box>

                  {/* Answers */}
                  <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.65rem" }}>Answers</Typography>
                  <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                    {feedbackData.submission.answers?.map((ans: any, idx: number) => (
                      <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.62rem" }}>
                          {ans.fieldLabel || ans.fieldId}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="#0f172a">
                          {Array.isArray(ans.value) ? ans.value.join(", ") : (ans.value?.toString() || "—")}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 5, px: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box sx={{ 
                    mb: 2.5, width: 72, height: 72, borderRadius: "50%", 
                    bgcolor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 0 8px #fffbeb" 
                  }}>
                    <Typography sx={{ fontSize: "2.2rem" }}>⏳</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={800} color="#0f172a" mb={1}>
                    Awaiting Feedback
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={4} maxWidth={320} sx={{ lineHeight: 1.6 }}>
                    The client hasn&apos;t submitted their feedback yet. You can remind them by resending the feedback form link.
                  </Typography>

                  {feedbackData.feedbackFormUrl && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} width="100%" justifyContent="center" alignItems="center">
                      <Button 
                        variant="contained" 
                        onClick={() => handleResendFeedback("whatsapp")}
                        sx={{ 
                          bgcolor: "#25D366", color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3, py: 1.2,
                          "&:hover": { bgcolor: "#128C7E", boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)" },
                          width: "100%", maxWidth: 220
                        }}
                      >
                        <WhatsAppIcon sx={{ mr: 1, fontSize: "1.2rem" }} /> Send Reminder
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => handleResendFeedback("email")}
                        sx={{ 
                          color: "#D44638", borderColor: "#fecaca", textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3, py: 1.2,
                          "&:hover": { bgcolor: "#fef2f2", borderColor: "#f87171" },
                          width: "100%", maxWidth: 220
                        }}
                      >
                        <EmailIcon sx={{ mr: 1, fontSize: "1.2rem" }} /> Email Reminder
                      </Button>
                    </Stack>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientFeedbackDialog;
