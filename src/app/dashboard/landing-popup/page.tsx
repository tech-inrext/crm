"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@/components/ui/Component";
import PageHeader from "@/fe/components/PageHeader";
import { useLandingPopup } from "@/hooks/useLandingPopup";
import PermissionGuard from "@/components/PermissionGuard";

const LandingPopupPage: React.FC = () => {
  const { popup, loading, error, createLandingPopup, updateLandingPopup, deleteLandingPopup, refresh } = useLandingPopup();
  const [form, setForm] = useState({
    propertyName: "",
    location: "",
    imageUrl: "",
    buttonText: "GET CALL BACK",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (popup) {
      setForm({
        propertyName: popup.propertyName || "",
        location: popup.location || "",
        imageUrl: popup.imageUrl || "",
        buttonText: popup.buttonText || "GET CALL BACK",
        isActive: popup.isActive === undefined ? true : popup.isActive,
      });
    }
  }, [popup]);

  const handleChange = (key: string, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (popup) {
        await updateLandingPopup(form);
      } else {
        await createLandingPopup(form as any);
      }
      await refresh();
      alert("Saved successfully");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete landing popup?")) return;
    setSaving(true);
    try {
      await deleteLandingPopup();
      setForm({ propertyName: "", location: "", imageUrl: "", buttonText: "GET CALL BACK", isActive: true });
      alert("Deleted successfully");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Landing Popup">
        <Box sx={{ display: "flex", gap: 1 }}>
          <PermissionGuard module="landing-popup" action="write" fallback={<></>}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {popup ? "Update" : "Create"}
            </Button>
          </PermissionGuard>
          {popup && (
            <PermissionGuard module="landing-popup" action="write" fallback={<></>}>
              <Button variant="outlined" color="error" onClick={handleDelete} disabled={saving}>
                Delete
              </Button>
            </PermissionGuard>
          )}
        </Box>
      </PageHeader>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Configure Landing Popup
          </Typography>

          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Property Name"
              value={form.propertyName}
              onChange={(e) => handleChange("propertyName", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Image URL"
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Button Text"
              value={form.buttonText}
              onChange={(e) => handleChange("buttonText", e.target.value)}
              fullWidth
              size="small"
            />

            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />}
              label="Active"
            />

            {form.imageUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Preview:</Typography>
                <Box component="img" src={form.imageUrl} alt="preview" sx={{ width: isMobile ? "100%" : 360, mt: 1, borderRadius: 1 }} />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LandingPopupPage;
