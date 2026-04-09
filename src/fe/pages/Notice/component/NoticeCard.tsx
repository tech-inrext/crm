"use client";

import React, { useState, useRef } from "react";
import DOMPurify from "dompurify";
import axios from "axios";

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

import NoticePreviewModal from "../hooks/NoticePreviewModal";
import { categoryColors } from "@/fe/pages/Notice/utils/noticeUtils";

/* ✅ AUTH */
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
};

export default function NoticeCard({ notice }: { notice: Notice }) {
  const color = categoryColors[notice.category] || "#1976d2";
  const sanitizedHTML = DOMPurify.sanitize(notice.description || "");

  const [open, setOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  /* ✅ ROLE CHECK */
  const { user } = useAuth();

  const currentRoleName =
    typeof user?.currentRole === "object"
      ? user?.currentRole?.name
      : user?.roles?.find((r: any) => r._id === user?.currentRole)?.name;

  const isAdminOrAVP =
    currentRoleName?.toLowerCase() === "admin" ||
    currentRoleName?.toLowerCase() === "avp";

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    setOpen(true);
  };

  /* ✅ DELETE FLOW */
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/v0/notice/${notice._id}`);
      alert("Notice deleted successfully");
      window.location.reload();
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteOpen(false);
    }
  };

  const imageAttachments =
    notice.attachments?.filter((att) =>
      /\.(jpeg|jpg|png|gif|webp)$/i.test(att.url)
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
    new Date(notice.createdAt).getTime() >
    Date.now() - 1000 * 60 * 60 * 24;

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="!rounded-2xl w-[90%] max-w-md mx-auto cursor-pointer bg-white flex flex-col h-[380px]"
      >
        {/* IMAGE */}
        <Box className="relative h-[200px] flex-shrink-0">
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
                <Box className="absolute top-2 right-2 z-10">
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

              {imageAttachments.length > 1 && (
                <>
                  <IconButton
                    onClick={scrollPrev}
                    className="!absolute top-1/2 left-1 -translate-y-1/2 !bg-white/40 !text-black/30 w-5 h-5"
                  >
                    <ArrowBackIosNewIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={scrollNext}
                    className="!absolute top-1/2 right-1 -translate-y-1/2 !bg-white/40 !text-black/30 w-5 h-5"
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </>
          ) : (
            <>
              <Box className="h-full bg-slate-100" />

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
          )}
        </Box>

        {/* HEADER */}
        <Box className="!px-2.5 !pt-3 !flex !items-center !justify-between flex-shrink-0">
          <Chip
            label={notice.category}
            size="small"
            sx={{
              fontWeight: 600,
              color: color,
              border: `1px solid ${color}`,
              backgroundColor: `${color}15`,
            }}
          />

          {isAdminOrAVP && (
            <Box>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" className="mr-2" />
                  Edit
                </MenuItem>

                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" className="mr-2" />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        {/* CONTENT */}
        <CardContent className="p-4 flex-1 overflow-hidden">
          <Typography className="!font-bold !text-[17px] text-slate-800">
            {notice.title}
          </Typography>

          <div
            className="text-sm !text-slate-600 !mt-2 !line-clamp-3"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        </CardContent>
      </Card>

      {/* PREVIEW MODAL */}
      <NoticePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        notice={notice}
        editMode={true}
      />

      {/* ✅ DELETE CONFIRM MODAL */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Notice</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete this notice?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}