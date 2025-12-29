import React from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import PermissionGuard from "@/components/PermissionGuard";
import { getCategoryLabel, SORT_OPTIONS } from "@/components/ui/training-videos/constants";

interface TrainingVideosActionBarProps {
  search: string;
  category: string;
  sortBy: string;
  categories: any[];
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (event: SelectChangeEvent) => void;
  onSortChange: (event: SelectChangeEvent) => void;
  onCategoryClick: (category: string) => void;
  onAdd: () => void;
}

export const TrainingVideosActionBar: React.FC<TrainingVideosActionBarProps> = ({
  search,
  category,
  sortBy,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onCategoryClick,
  onAdd,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search videos, descriptions..."
            value={search}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            size="small"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={onCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.name} value={cat.name}>
                  {getCategoryLabel(cat.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={onSortChange}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <PermissionGuard module="training-videos" action="write" fallback={<Box />}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAdd}
              fullWidth
              sx={{ height: '40px' }}
            >
              Add Video
            </Button>
          </PermissionGuard>
        </Grid>
      </Grid>
    </Box>
  );
};