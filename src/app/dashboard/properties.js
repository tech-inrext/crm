"use client";
import React, { useState } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Fab,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { Add } from "@mui/icons-material";
import PropertyCard from "@/components/ui/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { useDebounce } from "@/hooks/useDebounce";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import PermissionGuard from "@/components/PermissionGuard";
import PropertyDialog from "@/components/ui/PropertyDialog";
import PropertiesActionBar from "@/components/ui/PropertiesActionBar";
import Pagination from "@/components/ui/Pagination";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const Properties = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { getPermissions } = useAuth();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const { properties, loading, total, loadProperties } = useProperties(
    page,
    rowsPerPage,
    debouncedSearch
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const permissions = getPermissions("property");
  const canEdit = permissions.hasWriteAccess;

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (property) => {
    setEditingProperty(property);
    setDialogOpen(true);
  };

  const handleSaveProperty = async (propertyData) => {
    setSaving(true);
    try {
      if (editingProperty) {
        await axios.patch(`/api/v0/property/${editingProperty._id}`, propertyData);
        showSnackbar("Property updated successfully");
      } else {
        await axios.post("/api/v0/property", propertyData);
        showSnackbar("Property created successfully");
      }
      setDialogOpen(false);
      loadProperties();
    } catch (error) {
      console.error("Failed to save property", error);
      showSnackbar("Failed to save property", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (property) => {
    if (window.confirm(`Are you sure you want to delete "${property.projectName}"?`)) {
      try {
        await axios.delete(`/api/v0/property/${property._id}`);
        showSnackbar("Property deleted successfully");
        loadProperties();
      } catch (error) {
        console.error("Failed to delete property", error);
        showSnackbar("Failed to delete property", "error");
      }
    }
  };

  return (
    <Box sx={MODULE_STYLES.leads.leadsContainer}>
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
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Properties
        </Typography>
        <PropertiesActionBar
          search={search}
          onSearchChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onAdd={handleOpenAdd}
          saving={saving}
          canAdd={canEdit}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, minmax(280px, 1fr))",
                md: "repeat(auto-fill, minmax(300px, 1fr))",
                lg: "repeat(auto-fill, minmax(320px, 1fr))",
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 2, sm: 3 },
            }}
          >
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteProperty}
                  canEdit={canEdit}
                />
              ))
            ) : (
              <Typography
                textAlign="center"
                width="100%"
                mt={2}
                color="text.primary"
              >
                No properties found.
              </Typography>
            )}
          </Box>

          <Pagination
            page={page}
            pageSize={rowsPerPage}
            total={total}
            onPageChange={setPage}
            pageSizeOptions={[6, 12, 24, 48]}
            onPageSizeChange={(size) => {
              setRowsPerPage(size);
              setPage(1);
            }}
          />
        </>
      )}

      <PermissionGuard module="property" action="write" fallback={<></>}>
        <Fab
          color="primary"
          onClick={handleOpenAdd}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
            display: { xs: "flex", md: "none" },
            "&:hover": {
              background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
            },
          }}
        >
          <Add />
        </Fab>
      </PermissionGuard>

      <PropertyDialog
        open={dialogOpen}
        property={editingProperty}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveProperty}
        loading={saving}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Properties;