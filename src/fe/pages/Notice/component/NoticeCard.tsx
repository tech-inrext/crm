"use client";

import React, { useState, useRef, Dispatch, SetStateAction } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import dayjs from "dayjs";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import NoticePreviewModal from "../hooks/NoticePreviewModal";
import { categoryColors } from "@/fe/pages/Notice/utils/noticeUtils";
import { useAuth } from "@/contexts/AuthContext";

type Attachment = {
  url: string;
  filename: string;
};

type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  attachments?: Attachment[];
  priority?: string;
  pinned?: boolean;
};

export default function NoticeCard({
  notice,
  onDelete, // ✅ NEW PROP
  getAllNotice,
  updateNoticeLocal,
}: {
  notice: Notice;
  onDelete?: (id: string) => void;
  getAllNotice: () => Promise<Notice[]>;
  updateNoticeLocal: () => void;
}) {
  const color = categoryColors[notice.category] || "#1976d2";
  const sanitizedHTML = DOMPurify.sanitize(notice.description || "");

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  const openMenu = Boolean(anchorEl);

  /* ✅ ROLE CHECK */
  const { user, isSystemAdmin, isAVP } = useAuth();

  const isAdminOrAVP = Boolean(isSystemAdmin || isAVP);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteOpen(true);
  };

  /* ✅ FIXED DELETE (NO RELOAD) */
  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/v0/notice/${notice._id}`);

      // ✅ DO NOT force parent reload
      onDelete?.(notice._id);
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteOpen(false);
    }
  };

  const imageAttachments =
    notice.attachments?.filter((att) =>
      /\.(jpeg|jpg|png|gif|webp)$/i.test(att.url),
    ) || [];

  const scrollNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    carouselRef.current?.scrollBy({
      left: carouselRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const scrollPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    carouselRef.current?.scrollBy({
      left: -carouselRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const isLatest =
    new Date(notice.createdAt).getTime() > Date.now() - 1000 * 60 * 60 * 24;

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="!rounded-2xl w-[90%] max-w-md mx-auto cursor-pointer bg-white flex flex-col h-[400px] shadow-sm hover:shadow-md transition-shadow"
      >
        {/* IMAGE */}
        <Box className="relative h-[180px] flex-shrink-0">
          {imageAttachments.length > 0 ? (
            <>
              <Box
                ref={carouselRef}
                className="flex overflow-x-auto h-full scrollbar-hide"
              >
                {imageAttachments.map((img, idx) => (
                  <CardMedia
                    key={idx}
                    component="img"
                    image={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover flex-shrink-0"
                  />
                ))}
              </Box>

              {isLatest && (
                <Box className="absolute top-2 right-2">
                  <Chip
                    label="Latest"
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: 11,
                      height: 22,
                      color: "#16a34a",
                      backgroundColor: "#dcfce7",
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box className="h-full flex items-center justify-center bg-[#0f172a]">
              <img
                src="/inrext white logo png.png"
                alt="logo"
                className="w-28 h-28 object-contain"
              />
            </Box>
          )}
        </Box>

        {/* HEADER */}
        <Box className="px-4 pt-4 flex items-center justify-between">
          <Chip
            label={notice.category}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '11px',
              color: color,
              border: `1px solid ${color}40`,
              backgroundColor: `${color}10`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />

          <Box className="flex items-center">
            {notice.pinned && (
              <PushPinIcon className="text-blue-600 mr-1" fontSize="small" />
            )}
            {isAdminOrAVP && (
              <>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem onClick={() => setOpen(true)}>
                    <EditIcon fontSize="small" className="mr-2" />
                    Edit
                  </MenuItem>

                  <MenuItem onClick={handleDeleteClick}>
                    <DeleteIcon fontSize="small" className="mr-2" />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* CONTENT */}
        <CardContent className="px-4 pt-2 pb-4 flex-1 flex flex-col overflow-hidden">
          <Typography className="font-bold text-[17px] text-slate-800 leading-snug">
            {notice.title}
          </Typography>

          <div
            className="text-[13px] text-slate-500 mt-1 line-clamp-2 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />

          <Box className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <Box className="flex items-center text-slate-400">
              <CalendarTodayIcon sx={{ fontSize: 13 }} className="mr-1.5" />
              <Typography className="text-[12px] font-medium">
                {dayjs(notice.createdAt).format("DD MMM YYYY")}
              </Typography>
            </Box>

            <Box className="flex items-center gap-2">
              {notice.priority && notice.priority !== "Normal" && (
                <Chip
                  label={notice.priority}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '11px',
                    fontWeight: 600,
                    color: notice.priority === 'Urgent' ? '#dc2626' : '#ea580c',
                    bgcolor: notice.priority === 'Urgent' ? '#fef2f2' : '#fff7ed',
                    border: `1px solid ${notice.priority === 'Urgent' ? '#fca5a5' : '#fed7aa'}`,
                  }}
                />
              )}
              <Box className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                <ArrowForwardIcon sx={{ fontSize: 14 }} className="text-slate-500" />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* PREVIEW */}
      <NoticePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        notice={notice}
        getAllNotice={getAllNotice}
        updateNoticeLocal={updateNoticeLocal}
      />

      {/* DELETE MODAL */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Notice</DialogTitle>

        <DialogContent>
          <Typography>Are you sure you want to delete this notice?</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

