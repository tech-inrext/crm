"use client";

import React, { useState } from "react";
import DOMPurify from "dompurify";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import {
  categoryColors,
  priorityColors,
} from "@/fe/pages/Notice/utils/noticeUtils";

import { isImageFile, formatDate } from "../utils/noticeUtils";

/* ✅ IMPORT AUTH */
import { useAuth } from "@/contexts/AuthContext";

export default function NoticePreviewDialog({
  open,
  onClose,
  notice,
  onEdit,
}: any) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  /* ✅ ROLE CHECK START */
  const { user } = useAuth();

  const currentRoleName =
    typeof user?.currentRole === "object"
      ? user?.currentRole?.name
      : user?.roles?.find((r: any) => r._id === user?.currentRole)?.name;

  const isAdminOrAVP =
    currentRoleName?.toLowerCase() === "admin" ||
    currentRoleName?.toLowerCase() === "avp";
  /* ✅ ROLE CHECK END */

  const imageAttachments =
    notice?.attachments?.filter((att: any) => isImageFile(att.url)) || [];

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setPreviewOpen(true);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? imageAttachments.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === imageAttachments.length - 1 ? 0 : prev + 1,
    );
  };

  if (!notice) return null;

  const color = categoryColors[notice.category] || "#1976d2";
  const priorityColor = priorityColors[notice.priority] || "#1976d2";
  const attachmentCount = notice.attachments?.length || 0;

  const sanitizedHTML = DOMPurify.sanitize(notice.description || "");

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography className="!font-bold !text-lg">
              Notice Preview
            </Typography>

            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Stack spacing={3}>
            {/* CATEGORY + PRIORITY */}
            <Stack direction="row" justifyContent="space-between">
              <Chip
                label={notice.category}
                size="small"
                style={{
                  color: color,
                  borderColor: `${color}40`,
                  backgroundColor: `${color}10`,
                }}
              />

              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  icon={<AttachFileIcon />}
                  label={`${attachmentCount} Files`}
                />

                {notice.priority && (
                  <Chip
                    size="small"
                    label={notice.priority}
                    style={{
                      backgroundColor: `${priorityColor}20`,
                      color: priorityColor,
                    }}
                  />
                )}
              </Stack>
            </Stack>

            {/* TITLE */}
            <Stack spacing={0.5}>
              <Typography className="!font-bold !text-xl !mb-0">
                {notice.title}
              </Typography>

              <Stack direction="row" justifyContent="space-between">
                <Typography className="!text-xs text-gray-500 !m-0">
                  {notice.createdBy
                    ? `By ${notice.createdBy.name}`
                    : "Unknown Author"}
                </Typography>

                <Typography className="!text-xs text-gray-500 !m-0">
                  {formatDate(notice.createdAt)}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* DESCRIPTION */}
            <Box
              dangerouslySetInnerHTML={{
                __html: sanitizedHTML,
              }}
            />

            {/* ATTACHMENTS */}
            {attachmentCount > 0 && (
              <>
                <Divider />

                <Grid container spacing={2}>
                  {notice.attachments?.map((att: any, i: number) => {
                    const isImage = isImageFile(att.url);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        {isImage ? (
                          <Card
                            className="cursor-pointer"
                            onClick={() => {
                              const index = imageAttachments.findIndex(
                                (img: any) => img.url === att.url,
                              );
                              handleImageClick(index);
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="80"
                              image={att.url}
                            />

                            <CardContent>
                              <Typography className="!text-xs !truncate">
                                {att.filename}
                              </Typography>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="!p-3">
                            <Stack direction="row" spacing={1}>
                              <PictureAsPdfIcon className="text-red-500" />
                              <Typography className="!text-xs !truncate">
                                {att.filename}
                              </Typography>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              className="!mt-2"
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                href={att.url}
                                target="_blank"
                                fullWidth
                              >
                                View
                              </Button>

                              <Button
                                size="small"
                                variant="contained"
                                href={att.url}
                                download
                                fullWidth
                              >
                                Download
                              </Button>
                            </Stack>
                          </Card>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )}
          </Stack>
        </DialogContent>

        <Divider />

        {/* ✅ EDIT BUTTON ONLY FOR ADMIN / AVP */}
        {isAdminOrAVP && (
          <Box className="!p-4 !flex !justify-end">
            <Button variant="contained" onClick={onEdit}>
              Edit
            </Button>
          </Box>
        )}
      </Dialog>

      {/* IMAGE PREVIEW */}
      {/* IMAGE PREVIEW */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
      >
        <div className="relative bg-black flex flex-col items-center justify-center p-4">
          <IconButton
            onClick={() => setPreviewOpen(false)}
            className="!absolute !top-2 !right-2 !text-white"
          >
            <CloseIcon />
          </IconButton>

          {imageAttachments.length > 1 && (
            <IconButton
              onClick={handlePrev}
              className="!absolute !left-2 !top-1/2 !transform -translate-y-1/2 !text-white"
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          <img
            src={imageAttachments[selectedIndex]?.url || ""}
            alt="preview"
            className="max-h-[80vh] max-w-[90vw] object-contain my-4"
          />

          {imageAttachments.length > 1 && (
            <IconButton
              onClick={handleNext}
              className="!absolute !right-2 !top-1/2 !transform -translate-y-1/2 !text-white"
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}

          {/* ACTION BUTTONS */}
          <Stack direction="row" spacing={2} className="mt-2">
            <Button
              variant="outlined"
              color="primary"
              target="_blank"
              href={imageAttachments[selectedIndex]?.url}
            >
              Open
            </Button>

            <Button
              variant="contained"
              color="primary"
              href={imageAttachments[selectedIndex]?.url}
              download={imageAttachments[selectedIndex]?.filename}
            >
              Download
            </Button>
          </Stack>
        </div>
      </Dialog>
    </>
  );
}
