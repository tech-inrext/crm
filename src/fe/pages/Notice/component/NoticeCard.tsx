"use client";

import React, { useState } from "react";
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

  return (
    <>
      {/* Notice Card */}
      <Card
        onClick={() => setOpen(true)}
        className="!rounded-2xl flex flex-col h-full"
        sx={{
          borderLeft: showBorder ? `4px solid ${color}` : "none",
          cursor: "pointer",
          transition: "0.3s",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent className="flex flex-col flex-grow">
          {/* Category & Priority */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Chip
              label={notice.category}
              size="small"
              variant="outlined"
              className="!font-semibold !rounded-lg !px-2"
              sx={{
                color: color,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`,
              }}
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
                sx={{
                  backgroundColor: `${priorityColor}20`,
                  color: priorityColor,
                }}
              />
            )}
          </Stack>

          {/* Title & Description */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography className="!font-bold text-[16px] mb-1 min-h-[48px]">
              {notice.title}
            </Typography>

            <Typography className="!text-[13px] text-gray-500 !mb-2 !line-clamp-2 min-h-[34px]">
              {notice.description}
            </Typography>
          </Box>

          <Divider />

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography fontSize={12} fontWeight={700} color="text.secondary">
              {notice.createdBy
                ? `By ${notice.createdBy.name}`
                : "Unknown Author"}
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              {new Date(notice.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Notice Preview Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Notice Preview
            </Typography>

            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        {/* Content */}
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {/* Category & Priority */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Chip
                label={notice.category}
                size="small"
                variant="outlined"
                className="!font-semibold !rounded-lg !px-2"
                sx={{
                  color: color,
                  borderColor: `${color}40`,
                  backgroundColor: `${color}10`,
                }}
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
                  sx={{
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor,
                  }}
                />
              )}
            </Stack>

            {/* Title */}
            <Typography variant="h6" fontWeight={700}>
              {notice.title}
            </Typography>

            {/* Creator & Date */}
          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography fontSize={12} fontWeight={700} color="text.secondary">
              {notice.createdBy
                ? `By ${notice.createdBy.name}`
                : "Unknown Author"}
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              {new Date(notice.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>

            <Divider />

            {/* Description */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Description
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  lineHeight: 1.7,
                }}
              >
                {notice.description}
              </Typography>
            </Box>

            {/* Attachments */}
            {notice.attachments && notice.attachments.length > 0 && (
              <>
                <Divider />

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Attachments
                  </Typography>

                  <Grid container spacing={2}>
                    {notice.attachments.map((att, index) => {
                      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(
                        att.url,
                      );

                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          {isImage ? (
                            <Card
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: 2,
                                transition: "0.3s",
                                "&:hover": {
                                  boxShadow: 6,
                                },
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="120"
                                image={att.url}
                                alt={att.filename}
                              />

                              <CardContent sx={{ p: 1 }}>
                                <Typography fontSize={12} noWrap>
                                  {att.filename}
                                </Typography>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card
                              sx={{
                                p: 2,
                                textAlign: "center",
                                borderRadius: 2,
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <Typography fontSize={13} mb={1}>
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
