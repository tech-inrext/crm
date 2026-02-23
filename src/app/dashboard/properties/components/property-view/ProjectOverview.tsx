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
    <Card className="mb-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]  overflow-visible">
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
       <Box className="flex items-center mb-3 pb-2 border-b-2 border-blue-100">
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
        <Typography className="text-gray-500 leading-[1.8] text-[1.1rem] mb-4 whitespace-pre-wrap break-words">
          {formattedDescription}
        </Typography>

        <Grid container spacing={3}>
          {/* Project Status */}
          {statusList.length > 0 && (
            <Grid item xs={12} md={6}>
             <Paper className="p-3 rounded-2xl bg-blue-50 h-full">
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
                     <Box className="w-1.5 h-1.5 rounded-full bg-blue-600" />
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
                      <Box className="w-1.5 h-1.5 rounded-full bg-green-600" />
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
                       <Box className="w-2 h-2 rounded-full bg-yellow-500" />
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