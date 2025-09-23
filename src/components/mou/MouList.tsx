"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Divider,
} from "@mui/material";
import { Check } from "@mui/icons-material";

interface MouListProps {
  items: any[];
  loading: boolean;
  onMarkComplete: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onResend?: (id: string) => Promise<void>;
  view?: "pending" | "completed";
}

const MouList: React.FC<MouListProps> = ({
  items,
  loading,
  onMarkComplete,
  onApprove,
  onReject,
  onResend,
  view,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    id: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const openConfirm = (type: "approve" | "reject", id: string) => {
    setPendingAction({ type, id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { type, id } = pendingAction;
    setConfirmOpen(false);
    try {
      if (type === "approve" && onApprove) await onApprove(id);
      if (type === "reject" && onReject) await onReject(id);
    } catch (e) {
      // caller handles notifications
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };
  return (
    <Box>
      <Grid container spacing={2}>
        {items.map((emp) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={emp._id}>
            <Paper
              sx={{
                p: 4,
                position: "relative",
                borderRadius: 3,
                minHeight: 170,
                transition: "transform 150ms ease, box-shadow 150ms ease",
                "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              elevation={1}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 56,
                        height: 56,
                        fontSize: 18,
                      }}
                    >
                      {String(emp.name || "")
                        .split(" ")
                        .map((s: string) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                        {emp.name}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}
                      >
                        {emp.email}
                      </Typography>
                      {emp.designation && (
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: 13,
                            mt: 0.5,
                          }}
                        >
                          {emp.designation}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      pt: 1,
                    }}
                  >
                    {/** Show different actions based on view */}
                    {/** default to pending actions */}
                    {(!view || view === "pending") && (
                      <>
                        <Button
                          size="medium"
                          color="success"
                          variant="contained"
                          startIcon={<Check fontSize="small" />}
                          onClick={() => {
                            if (!emp._id) return;
                            openConfirm("approve", emp._id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 140,
                            borderRadius: 2,
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="medium"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            if (!emp._id) return;
                            openConfirm("reject", emp._id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 120,
                            borderRadius: 2,
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {view === "completed" && (
                      <>
                        <Button
                          size="medium"
                          variant="outlined"
                          onClick={() => {
                            if (!emp._id) return;
                            setPreviewId(emp._id);
                            setPreviewOpen(true);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 120,
                            borderRadius: 2,
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          size="medium"
                          color="primary"
                          variant="contained"
                          onClick={() => {
                            if (!emp._id) return;
                            if (onResend) onResend(emp._id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 140,
                            borderRadius: 2,
                          }}
                        >
                          Resend Mail
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              <Chip
                label={emp.mouStatus || "-"}
                color={emp.mouStatus === "Completed" ? "success" : "warning"}
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={confirmOpen} onClose={handleCancel} fullWidth maxWidth="lg">
        <DialogTitle>
          {pendingAction?.type === "approve"
            ? "Preview & Confirm Approve"
            : "Confirm Reject"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {pendingAction?.type === "approve" ? (
            <Box sx={{ width: "100%", height: "70vh" }}>
              {pendingAction?.id && (
                // preview the generated PDF via the existing preview API
                // eslint-disable-next-line @next/next/no-img-element
                <iframe
                  title="MOU Preview"
                  src={`/api/v0/mou/pdf/preview?id=${pendingAction.id}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              )}
            </Box>
          ) : (
            <DialogContentText>
              Are you sure you want to reject this MOU? This action cannot be
              undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          {pendingAction?.type === "approve" && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", mr: "auto", pl: 1 }}
            >
              Note: Confirm will send email to associate with MOU pdf
            </Typography>
          )}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            color={pendingAction?.type === "approve" ? "success" : "error"}
            variant={
              pendingAction?.type === "approve" ? "contained" : "outlined"
            }
          >
            {pendingAction?.type === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>MOU Preview</DialogTitle>
        <DialogContent sx={{ height: "80vh" }}>
          {previewId && (
            <iframe
              title="MOU Preview"
              src={`/api/v0/mou/pdf/preview?id=${previewId}`}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MouList;
