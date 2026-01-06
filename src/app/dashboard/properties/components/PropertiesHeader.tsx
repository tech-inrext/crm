// app/dashboard/properties/components/PropertiesHeader.tsx
"use client";

import React from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
} from "@mui/material";
import { Add, FilterList, Search } from "@mui/icons-material";

interface PropertiesHeaderProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeFiltersCount: number;
  showFilters: boolean;
  toggleFilters: () => void;
  canCreateProperty: boolean;
  onAddProperty: () => void;
  totalItems: number;
  filters: {
    propertyType: string;
    status: string;
    location: string;
    builderName: string;
    visibility: string;
  };
  searchTerm: string;
}

const PropertiesHeader: React.FC<PropertiesHeaderProps> = ({
  searchTerm,
  onSearchChange,
  activeFiltersCount,
  showFilters,
  toggleFilters,
  canCreateProperty,
  onAddProperty,
  totalItems,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        borderRadius: { xs: 1, sm: 2, md: 3 },
        mb: { xs: 1, sm: 2, md: 3 },
        mt: { xs: 0.5, sm: 1, md: 2 },
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          mb: { xs: 2, md: 3 },
          textAlign: { xs: "left", sm: "left" },
        }}
      >
        Properties
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            placeholder="Search properties..."
            value={searchTerm}
            onChange={onSearchChange}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={toggleFilters}
            sx={{ height: '40px' }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          {canCreateProperty && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddProperty}
              fullWidth
              sx={{ 
                height: '40px',
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#115293" }
              }}
            >
              Add Property
            </Button>
          )}
        </Grid>
      </Grid>

      {(searchTerm || activeFiltersCount > 0) && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 2,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Found {totalItems} project{totalItems !== 1 ? "s" : ""}{" "}
          {searchTerm && ` matching "${searchTerm}"`}
          {activeFiltersCount > 0 &&
            ` with ${activeFiltersCount} filter${
              activeFiltersCount !== 1 ? "s" : ""
            } applied`}
        </Typography>
      )}
    </Paper>
  );
};

export default PropertiesHeader;