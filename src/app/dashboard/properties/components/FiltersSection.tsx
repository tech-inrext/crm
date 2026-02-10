// app/dashboard/properties/components/FiltersSection.tsx
"use client";

import React from "react";
import {
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Collapse,
} from "@mui/material";

interface FiltersSectionProps {
  showFilters: boolean;
  filters: {
    propertyType: string;
    status: string;
    location: string;
    builderName: string;
    visibility: string;
  };
  onFilterChange: (filterType: string, value: any) => void;
  onClearAllFilters: () => void;
  onRemoveFilter: (filterType: string) => void;
  activeFiltersCount: number;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  showFilters,
  filters,
  onFilterChange,
  onClearAllFilters,
  onRemoveFilter,
  activeFiltersCount,
}) => {
  return (
    <Collapse in={showFilters}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: "15px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} active`}
                size="small"
                color="primary"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Button
            onClick={onClearAllFilters}
            variant="outlined"
            size="small"
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filters.propertyType}
                onChange={(e) =>
                  onFilterChange("propertyType", e.target.value)
                }
                label="Property Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="project">Main Projects</MenuItem>
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="plot">Plot</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Ready to Move">Ready to Move</MenuItem>
                <MenuItem value="Under Construction">
                  Under Construction
                </MenuItem>
                <MenuItem value="New Launch">New Launch</MenuItem>
                <MenuItem value="Pre Launch">Pre Launch</MenuItem>
                <MenuItem value="Sold Out">Sold Out</MenuItem>
                <MenuItem value="Coming Soon">Coming Soon</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Location"
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
              placeholder="Enter location"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Builder"
              value={filters.builderName}
              onChange={(e) =>
                onFilterChange("builderName", e.target.value)
              }
              placeholder="Builder name"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Visibility</InputLabel>
              <Select
                value={filters.visibility}
                onChange={(e) =>
                  onFilterChange("visibility", e.target.value)
                }
                label="Visibility"
              >
                <MenuItem value="">All Properties</MenuItem>
                <MenuItem value="public">Public Only</MenuItem>
                <MenuItem value="private">Private Only</MenuItem>
                <MenuItem value="featured">Featured Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Filters:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {filters.propertyType && (
                <Chip
                  label={`Type: ${filters.propertyType}`}
                  onDelete={() => onRemoveFilter("propertyType")}
                  size="small"
                />
              )}
              {filters.status && (
                <Chip
                  label={`Status: ${filters.status}`}
                  onDelete={() => onRemoveFilter("status")}
                  size="small"
                />
              )}
              {filters.location && (
                <Chip
                  label={`Location: ${filters.location}`}
                  onDelete={() => onRemoveFilter("location")}
                  size="small"
                />
              )}
              {filters.builderName && (
                <Chip
                  label={`Builder: ${filters.builderName}`}
                  onDelete={() => onRemoveFilter("builderName")}
                  size="small"
                />
              )}
              {filters.visibility && (
                <Chip
                  label={`Visibility: ${filters.visibility}`}
                  onDelete={() => onRemoveFilter("visibility")}
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Collapse>
  );
};

export default FiltersSection;