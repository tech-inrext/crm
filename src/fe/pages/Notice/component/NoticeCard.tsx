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
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import {
  categoryColors,
  priorityColors,
} from "@/fe/pages/Notice/utils/noticeUtils";

type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  pinned: boolean;
  createdAt: string;
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

  // ✅ Modal state
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="!rounded-2xl flex flex-col h-full"
        style={{
          borderLeft: showBorder ? `4px solid ${color}` : "none",
          cursor: "pointer",
        }}
      >
        <CardContent className="flex flex-col flex-grow">
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
              style={{
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
                      ></span>

                      <span
                        className="relative inline-flex rounded-full h-3 w-3"
                        style={{ backgroundColor: priorityColor }}
                      ></span>
                    </span>

                    {notice.priority}
                  </span>
                }
                className="rounded-full px-2"
                style={{
                  backgroundColor: `${priorityColor}20`,
                  color: priorityColor,
                }}
              />
            )}
          </Stack>

          <Box sx={{ flexGrow: 1 }}>
            <Typography className="!font-bold text-[16px] mb-1 min-h-[48px]">
              {notice.title}
            </Typography>

            <Typography className="!text-[13px] text-gray-500 !mb-2 !line-clamp-2 min-h-[34px]">
              {notice.description}
            </Typography>
          </Box>

          <Divider />

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

      {/* ✅ Notice Preview Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Notice Preview</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Chip label={notice.category} />

            <Typography fontWeight={700}>{notice.title}</Typography>

            <Typography color="text.secondary" fontSize={13}>
              By {notice.createdBy?.name || "Unknown"} |{" "}
              {new Date(notice.createdAt).toLocaleDateString()}
            </Typography>

            <Divider />

            <Typography>{notice.description}</Typography>
          </Stack>
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
    </>
  );
}