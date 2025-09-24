// app/dashboard/properties/page.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from "@mui/material";
import { Add, Edit, Delete, LocationOn, AttachMoney } from "@mui/icons-material";

// Mock data for demonstration
const mockProperties = [
  {
    id: 1,
    projectName: "Skyline Towers",
    builderName: "Prestige Group",
    location: "Bangalore",
    price: "₹2.5 Cr",
    status: "Under Construction",
    features: ["Swimming Pool", "Gym", "Park"],
    amenities: ["Club House", "Children's Play Area", "Security"],
    description: "Luxury apartments in prime location"
  },
  {
    id: 2,
    projectName: "Green Valley",
    builderName: "DLF",
    location: "Gurgaon",
    price: "₹1.8 Cr",
    status: "Ready to Move",
    features: ["Green Spaces", "Power Backup", "Parking"],
    amenities: ["Shopping Complex", "Hospital", "School"],
    description: "Eco-friendly residential complex"
  }
];

const statusOptions = ["Under Construction", "Ready to Move", "Pre Launch"];

export default function PropertiesPage() {
  const [properties, setProperties] = useState(mockProperties);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    projectName: "",
    builderName: "",
    location: "",
    price: "",
    status: "Under Construction",
    features: [] as string[],
    amenities: [] as string[],
    description: ""
  });
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState("");

  const handleOpenDialog = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData(property);
    } else {
      setEditingProperty(null);
      setFormData({
        projectName: "",
        builderName: "",
        location: "",
        price: "",
        status: "Under Construction",
        features: [],
        amenities: [],
        description: ""
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (editingProperty) {
      // Update existing property
      setProperties(prev =>
        prev.map(p => (p.id === editingProperty.id ? { ...formData, id: editingProperty.id } : p))
      );
      setSnackbar({ open: true, message: "Property updated successfully", severity: "success" });
    } else {
      // Add new property
      const newProperty = {
        ...formData,
        id: Math.max(...properties.map(p => p.id)) + 1
      };
      setProperties(prev => [...prev, newProperty]);
      setSnackbar({ open: true, message: "Property added successfully", severity: "success" });
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setProperties(prev => prev.filter(p => p.id !== id));
      setSnackbar({ open: true, message: "Property deleted successfully", severity: "success" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready to Move": return "success";
      case "Under Construction": return "warning";
      case "Pre Launch": return "info";
      default: return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            Properties Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
              },
            }}
          >
            Add Property
          </Button>
        </Box>
      </Paper>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <Paper sx={{ p: 2, height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  {property.projectName}
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenDialog(property)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(property.id)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                by {property.builderName}
              </Typography>

              <Box display="flex" alignItems="center" mb={1}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" ml={0.5}>
                  {property.location}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoney fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" ml={0.5}>
                  {property.price}
                </Typography>
              </Box>

              <Chip
                label={property.status}
                size="small"
                color={getStatusColor(property.status) as any}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" paragraph>
                {property.description}
              </Typography>

              {property.features.length > 0 && (
                <Box mb={2}>
                  <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                    Features:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {property.features.slice(0, 3).map((feature, index) => (
                      <Chip key={index} label={feature} size="small" variant="outlined" />
                    ))}
                    {property.features.length > 3 && <Chip label="..." size="small" />}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? "Edit Property" : "Add New Property"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={handleInputChange("projectName")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Builder Name"
                value={formData.builderName}
                onChange={handleInputChange("builderName")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange("location")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                value={formData.price}
                onChange={handleInputChange("price")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange("description")}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Features
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <Button onClick={handleAddFeature} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => removeFeature(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Amenities
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddAmenity()}
                />
                <Button onClick={handleAddAmenity} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    onDelete={() => removeAmenity(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProperty ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as any}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}