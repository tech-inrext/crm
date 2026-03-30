"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Divider,
  Box,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type NoticeAttachment = {
  filename: string;
  url: string;
};

type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  createdAt: string;
  attachments?: NoticeAttachment[];
  createdBy?: {
    name: string;
  };
};

export default function NoticePreviewModal({
  open,
  onClose,
  notice,
}: {
  open: boolean;
  onClose: () => void;
  notice: Notice | null;
}) {
  if (!notice) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700}>Notice Preview</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Category & Priority */}
        <Stack direction="row" spacing={2} mb={2}>
          <Chip label={notice.category} color="primary" />
          <Chip label={notice.priority} color="error" />
        </Stack>

        {/* Title */}
        <Typography variant="h6" fontWeight={700} mb={1}>
          {notice.title}
        </Typography>

        {/* Author & Date */}
        <Typography fontSize={13} color="text.secondary" mb={2}>
          By {notice.createdBy?.name || "Unknown"} |{" "}
          {new Date(notice.createdAt).toLocaleDateString()}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        Description
        <Box mb={2}>
          <Typography fontSize={15} lineHeight={1.7}>
            {notice.description}
          </Typography>
        </Box>

        {/* Attachments / Images */}
        {notice.attachments && notice.attachments.length > 0 && (
          <Box mb={2}>
            <Typography fontWeight={600} mb={1}>
              Attachments:
            </Typography>
            <Grid container spacing={2}>
              {notice.attachments.map((att) => {
                // Check if the file is an image
                const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(att.url);

                return (
                  <Grid item xs={12} sm={6} md={4} key={att.url}>
                    {isImage ? (
                      <Box
                        component="img"
                        src={att.url}
                        alt={att.filename}
                        sx={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid #ddd",
                        }}
                        onError={(e) => {
                          // fallback if image fails to load
                          (e.target as HTMLImageElement).src =
                            "/fallback-image.png"; // You can use a placeholder image
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          p: 1,
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          textAlign: "center",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <Typography fontSize={12}>{att.filename}</Typography>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, display: "block", marginTop: 4 }}
                        >
                          Download
                        </a>
                      </Box>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}