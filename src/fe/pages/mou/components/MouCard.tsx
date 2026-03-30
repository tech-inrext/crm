"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Check,
} from "@/components/ui/Component";
import { MouCardProps } from "../types";

const MouCard: React.FC<MouCardProps> = ({
  emp,
  view,
  onApproveConfirm,
  onRejectConfirm,
  onPreview,
  onResend,
}) => {
  return (
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
            {(!view || view === "pending") && (
              <>
                <Button
                  type="button"
                  size="medium"
                  color="success"
                  variant="contained"
                  startIcon={<Check fontSize="small" />}
                  onClick={() => {
                    if (!emp._id) return;
                    onApproveConfirm(emp._id);
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
                  type="button"
                  size="medium"
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    if (!emp._id) return;
                    onRejectConfirm(emp._id);
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
                  type="button"
                  size="medium"
                  variant="outlined"
                  onClick={() => {
                    if (!emp._id) return;
                    onPreview(emp._id);
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
                  type="button"
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
  );
};

export default MouCard;
