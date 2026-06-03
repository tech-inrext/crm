"use client";

import React, { useState } from "react";
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
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@/components/ui/Component";
import { CardMedia } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import PageHeader from "@/fe/components/PageHeader";
import { useLandingPopup, LandingPopupData } from "@/hooks/useLandingPopup";
import { useFileUpload } from "@/hooks/useFileUpload";
import PermissionGuard from "@/components/PermissionGuard";

const LandingPopupPage: React.FC = () => {
  const {
    popups,
    loading,
    createLandingPopup,
    updateLandingPopup,
    deleteLandingPopup,
    refresh,
  } = useLandingPopup();
  const { uploadFile, uploading: fileUploading } = useFileUpload();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    imageUrl: string;
    buttonText: string;
    isActive: boolean;
  }>({
    imageUrl: "",
    buttonText: "GET CALL BACK",
    isActive: false,
  });
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState<
    "success" | "error" | "info"
  >("success");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenDialog = (popup?: LandingPopupData) => {
    if (popup) {
      setEditingId(popup._id || null);
      setForm({
        imageUrl: popup.imageUrl,
        buttonText: popup.buttonText,
        isActive: popup.isActive,
      });
    } else {
      setEditingId(null);
      setForm({
        imageUrl: "",
        buttonText: "GET CALL BACK",
        isActive: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (key: string, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSnack = (
    message: string,
    severity: "success" | "error" | "info" = "success",
  ) => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    try {
      handleSnack("Uploading image...", "info");
      const imageUrl = await uploadFile(file);
      handleChange("imageUrl", imageUrl);
      handleSnack("Image uploaded successfully", "success");
    } catch (err: any) {
      handleSnack(err.message || "Failed to upload image", "error");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        handleSnack("Please select a valid image file", "error");
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleSave = async () => {
    if (
      !form.imageUrl ||
      !form.buttonText
    ) {
      handleSnack("Please fill all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateLandingPopup(editingId, form);
        handleSnack("Updated successfully", "success");
      } else {
        await createLandingPopup(form as any);
        handleSnack("Created successfully", "success");
      }
      handleCloseDialog();
    } catch (err: any) {
      handleSnack(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionLoadingId(id);
    try {
      await updateLandingPopup(id, { isActive: !currentStatus });
      handleSnack(
        !currentStatus ? "Published on website" : "Unpublished from website",
        "success",
      );
    } catch (err: any) {
      handleSnack(err.message || "Failed to update status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    setActionLoadingId(deleteConfirmId);
    try {
      await deleteLandingPopup(deleteConfirmId);
      handleSnack("Deleted successfully", "success");
      setDeleteConfirmId(null);
    } catch (err: any) {
      handleSnack(err.message || "Failed to delete", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Landing Popups">
        <PermissionGuard module="landing-popup" action="write" fallback={<></>}>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Add New Popup
          </Button>
        </PermissionGuard>
      </PageHeader>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackMessage}
        </Alert>
      </Snackbar>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : popups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            No landing popups yet. Create one to get started!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ p: { xs: 2, md: 2 } }}>
          {popups.map((popup) => (
            <Grid item xs={12} sm={6} md={6} key={popup._id}>
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 520,
                  mx: "auto",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  border: popup.isActive ? "2px solid" : "1px solid",
                  borderColor: popup.isActive ? "success.main" : "divider",
                  "&:hover": {
                    boxShadow: "0 8px 18px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* Image */}
                <CardMedia
                  component="img"
                  height="120"
                  image={popup.imageUrl}
                  alt="Landing Popup"
                  sx={{ objectFit: "cover" }}
                />

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, py: 1.5, px: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      Landing Popup
                    </Typography>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        backgroundColor: popup.isActive
                          ? "success.light"
                          : "warning.light",
                        color: popup.isActive ? "success.dark" : "warning.dark",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {popup.isActive ? "Published" : "Draft"}
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5, fontSize: "0.85rem" }}
                  >
                    Button: <strong>{popup.buttonText}</strong>
                  </Typography>
                  {popup.createdAt && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      Created: {new Date(popup.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>

                {/* Actions */}
                <CardActions
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    gap: 0.5,
                  }}
                >
                  <PermissionGuard
                    module="landing-popup"
                    action="write"
                    fallback={<></>}
                  >
                    {/* Toggle Status */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        Status:
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={popup.isActive}
                            onChange={() =>
                              handleToggleStatus(popup._id!, popup.isActive)
                            }
                            size="small"
                            disabled={actionLoadingId === popup._id}
                          />
                        }
                        label={popup.isActive ? "Live" : "Draft"}
                        sx={{ m: 0 }}
                      />
                    </Box>

                    {/* Edit Button */}
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(popup)}
                      disabled={actionLoadingId === popup._id}
                    >
                      Edit
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(popup._id!)}
                      disabled={actionLoadingId === popup._id}
                    >
                      Delete
                    </Button>
                  </PermissionGuard>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit Landing Popup" : "Create New Landing Popup"}
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontSize: "0.875rem" }}
            >
              Image Upload
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={fileUploading}
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.875rem",
                cursor: fileUploading ? "not-allowed" : "pointer",
              }}
            />
            {fileUploading && (
              <Typography
                variant="caption"
                color="info.main"
                sx={{ display: "block", mb: 1 }}
              >
                ⏳ Uploading image...
              </Typography>
            )}
          </Box>

          <TextField
            label="Image URL (auto-filled from upload)"
            value={form.imageUrl}
            onChange={(e) => handleChange("imageUrl", e.target.value)}
            fullWidth
            size="small"
            placeholder="Will be auto-filled when you upload an image"
            helperText="Or paste a URL directly"
          />

          <TextField
            label="Button Text"
            value={form.buttonText}
            onChange={(e) => handleChange("buttonText", e.target.value)}
            fullWidth
            size="small"
          />

          {form.imageUrl && (
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                Preview:
              </Typography>
              <Box
                component="img"
                src={form.imageUrl}
                alt="preview"
                sx={{
                  width: "100%",
                  maxHeight: 250,
                  borderRadius: 1,
                  objectFit: "cover",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Delete Landing Popup?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={saving}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPopupPage;
