"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from "@/components/ui/Component";
import { MouListProps } from "../types";
import { useMouListActions } from "../hooks/useMouPage";
import {
  dialgonContentSx,
  previewContainerSx,
  noteTextSx,
  fullPreviewContentSx,
} from "./styles";
import MouCard from "./MouCard";
import PreviewLoader from "./PreviewLoader";


const MouList: React.FC<MouListProps> = ({
  items,
  loading,
  onMarkComplete,
  onApprove,
  onReject,
  onResend,
  view,
}) => {
  const {
    confirmOpen,
    pendingAction,
    previewOpen,
    previewId,
    openConfirm,
    handleConfirm,
    handleCancel,
    openPreview,
    closePreview,
  } = useMouListActions(onApprove, onReject);

  return (
    <Box>
      <Grid container spacing={2}>
        {items.map((emp) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={emp._id}>
            <MouCard
              emp={emp}
              view={view}
              onApproveConfirm={(id) => openConfirm("approve", id)}
              onRejectConfirm={(id) => openConfirm("reject", id)}
              onPreview={openPreview}
              onResend={onResend}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog open={confirmOpen} onClose={handleCancel} fullWidth maxWidth="lg">
        <DialogTitle>
          {pendingAction?.type === "approve"
            ? "Preview & Confirm Approve"
            : "Confirm Reject"}
        </DialogTitle>
        <DialogContent sx={dialgonContentSx}>
          {pendingAction?.id && (
            <Box sx={previewContainerSx}>
              <PreviewLoader id={pendingAction.id} />
            </Box>
          )}
          {pendingAction?.type === "reject" && (
            <DialogContentText>
              Are you sure you want to reject this MOU? This action cannot be
              undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          {pendingAction?.type === "approve" && (
            <Typography variant="caption" sx={noteTextSx}>
              Note: Confirm will send email to associate with MOU pdf
            </Typography>
          )}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="button"
            onClick={handleConfirm}
            color={pendingAction?.type === "approve" ? "success" : "error"}
            variant={
              pendingAction?.type === "approve" ? "contained" : "outlined"
            }
          >
            {pendingAction?.type === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={previewOpen} onClose={closePreview} fullWidth maxWidth="lg">
        <DialogTitle>MOU Preview</DialogTitle>
        <DialogContent sx={fullPreviewContentSx}>
          {previewId && <PreviewLoader id={previewId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MouList;
