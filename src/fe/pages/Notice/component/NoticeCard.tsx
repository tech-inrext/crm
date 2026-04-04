"use client";

import React, { useState } from "react";
import DOMPurify from "dompurify";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Button,
  CardMedia,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import {
  categoryColors,
  priorityColors,
} from "@/fe/pages/Notice/utils/noticeUtils";

type Attachment = {
  url: string;
  filename: string;
};

type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  pinned: boolean;
  createdAt: string;
  attachments?: Attachment[];
  createdBy?: {
    name: string;
  };
};

export default function NoticeCard({
  notice,
  showBorder = true,
}: {
  notice: Notice;
  showBorder?: boolean;
}) {
  const color = categoryColors[notice.category] || "#1976d2";
  const priorityColor = priorityColors[notice.priority] || "#1976d2";

  const [open, setOpen] = useState(false);
  const attachmentCount = notice.attachments?.length || 0;

  const sanitizedHTML = DOMPurify.sanitize(notice.description || "");

  return (
    <>
      {/* ================= CARD ================= */}
      <Card
        onClick={() => setOpen(true)}
        className="!rounded-2xl !flex !flex-col !h-full !min-h-[200px] !cursor-pointer !transition-all !duration-300 hover:!shadow-[0px_6px_20px_rgba(0,0,0,0.15)] hover:!-translate-y-[3px]"
        style={{
          borderLeft: showBorder ? `4px solid ${color}` : "none",
        }}
      >
        <CardContent className="!flex !flex-col !flex-grow !p-5">
          {/* Top Row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="!mb-2"
          >
            <Chip
              label={notice.category}
              size="small"
              variant="outlined"
              className="!font-semibold !rounded-lg"
              style={{
                color: color,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`,
              }}
            />

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                icon={<AttachFileIcon className="!text-[16px]" />}
                label={attachmentCount}
                className="!font-semibold"
                style={{ backgroundColor: "#f1f5f9" }}
              />

              {notice.priority && (
                <Chip
                  size="small"
                  label={
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="relative flex h-3 w-3">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: priorityColor }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-3 w-3"
                          style={{ backgroundColor: priorityColor }}
                        />
                      </span>
                      {notice.priority}
                    </span>
                  }
                  className="!font-semibold"
                  style={{
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor,
                  }}
                />
              )}
            </Stack>
          </Stack>

          {/* Title */}
          <Typography className="!font-semibold !text-[18px] !mb-0.5 !mt-1 !leading-[1.5] !min-h-[48px]">
            {notice.title}
          </Typography>

          {/* Rich Text Preview (CLAMPED) */}
          <Box
            className="prose max-w-none flex-grow mb-2 !text-[14px] line-clamp-2"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />

          <Divider />

          {/* Footer */}
          <Stack
            direction="row"
            justifyContent="space-between"
            className="!mt-auto !pt-2"
          >
            <Typography className="!text-[12px] !font-semibold !text-gray-500">
              {notice.createdBy
                ? `By ${notice.createdBy.name}`
                : "Unknown Author"}
            </Typography>

            <Typography className="!text-[12px] !text-gray-500">
              {new Date(notice.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* ================= MODAL ================= */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: "!rounded-2xl !p-4", // smooth rounded modal
        }}
      >
        {/* Modal Header */}
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography className="!font-bold !text-lg">
              Notice Preview
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        {/* Modal Body */}
        <DialogContent>
          <Stack spacing={3}>
            {/* Top Row: Category, Attachments, Priority */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Chip
                label={notice.category}
                size="small"
                variant="outlined"
                className="!font-semibold"
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
                  label={
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="relative flex h-3 w-3">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: priorityColor }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-3 w-3"
                          style={{ backgroundColor: priorityColor }}
                        />
                      </span>
                      {notice.priority}
                    </span>
                  }
                  className="!font-semibold"
                  style={{
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor,
                  }}
                />
              )}
              </Stack>
            </Stack>

            {/* Title */}
            {/* Title */}
            <Typography className="!text-[17px] !font-bold">
              {notice.title}
            </Typography>

            {/* Author & Date */}
            <Stack
              direction="row"
              justifyContent="space-between"
              className="!mt-1"
            >
              <Typography className="!text-[12px] !font-semibold !text-gray-500 !mt-1 !mb-0">
                {notice.createdBy
                  ? `By ${notice.createdBy.name}`
                  : "Unknown Author"}
              </Typography>
              <Typography className="!text-[12px] !font-semibold !text-gray-500 !mt-1 !mb-0">
                {new Date(notice.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>

            <Divider />

            {/* Description */}
            <Box>
              <Typography className="!font-semibold !text-sm !mb-1">
                Description
              </Typography>
              <Box
                className="prose max-w-none !text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              />
            </Box>

            {/* Attachments */}
            {attachmentCount > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography className="!font-semibold !mb-2">
                    Attachments
                  </Typography>
                  <Grid container spacing={2}>
                    {notice.attachments?.map((att, index) => {
                      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(
                        att.url,
                      );

                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          {isImage ? (
                            <Card className="!rounded-lg !overflow-hidden hover:!shadow-lg">
                              <CardMedia
                                component="img"
                                height="80"
                                image={att.url}
                              />
                              <CardContent className="!p-2">
                                <Typography className="!text-xs !truncate">
                                  {att.filename}
                                </Typography>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="!text-center !p-2 !rounded-lg">
                              <Typography className="!text-xs !mb-1">
                                {att.filename}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                href={att.url}
                                target="_blank"
                                fullWidth
                              >
                                Download
                              </Button>
                            </Card>
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
