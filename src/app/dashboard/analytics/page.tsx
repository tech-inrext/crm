"use client";

import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Analytics as AnalyticsIcon } from "@mui/icons-material";

export default function AnalyticsPage() {
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  if (isProduction) {
    return null; // or redirect, or show 404
  }

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fa",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid #e0e0e0",
            background: "linear-gradient(135deg, #ffffff 0%, #f1f4f9 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(55, 133, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <AnalyticsIcon sx={{ fontSize: 40, color: "#3785FF" }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            Analytics Redesign
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#666", mb: 4, lineHeight: 1.6 }}
          >
            We are currently redesigning the Analytics module to provide you
            with better insights and a more powerful dashboard experience.
          </Typography>
          <Box
            sx={{
              display: "inline-block",
              px: 3,
              py: 1,
              borderRadius: 2,
              bgcolor: "#3785FF",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Coming Soon
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
