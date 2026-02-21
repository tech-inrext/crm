// app/dashboard/properties/components/property-view/ProjectOverview.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import { Property } from "@/services/propertyService";

interface ProjectOverviewProps {
  property: Property;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ property }) => {
  // ✅ Normalize description (handle \r\n and null)
  const formattedDescription =
    property?.description?.replace(/\r\n/g, "\n") || "No description available.";

  // ✅ Helper to normalize string/array fields
  const normalizeToArray = (value: string | string[] | undefined) => {
    if (!value) return [];
    return Array.isArray(value)
      ? value
      : value.split(",").map((item) => item.trim());
  };

  const statusList = normalizeToArray(property?.status);
  const nearbyList = normalizeToArray(property?.nearby);
  const highlightsList = normalizeToArray(property?.projectHighlights);

  return (
    <Card
      sx={{
        mb: 4,
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            pb: 2,
            borderBottom: "2px solid",
            borderColor: "primary.100",
          }}
        >
          <Description
            sx={{ mr: 2, color: "primary.main", fontSize: 28 }}
          />
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "primary.main" }}
          >
            Project Overview
          </Typography>
        </Box>
        
        {/* ✅ Description (FIXED PROPERLY) */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            lineHeight: 1.8,
            fontSize: "1.1rem",
            mb: 4,
            whiteSpace: "pre-wrap", // 🔥 PRESERVES LINE BREAKS EXACTLY
            wordBreak: "break-word",
          }}
        >
          {formattedDescription}
        </Typography>

        <Grid container spacing={3}>
          {/* Project Status */}
          {statusList.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "primary.50",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "primary.main", mb: 2 }}
                >
                🏗️ Project Status
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {statusList.map((item, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Nearby Locations */}
          {nearbyList.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                  📍 Nearby Locations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {nearbyList.map((item, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Project Highlights */}
          {highlightsList.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                  ⭐ Project Highlights
                </Typography>

                <Grid container spacing={2}>
                  {highlightsList.map((point, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {point}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;