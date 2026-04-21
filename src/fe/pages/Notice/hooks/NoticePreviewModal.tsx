"use client";

import React, { useState, useEffect, useCallback } from "react";
import NoticePreviewDialog from "../component/NoticePreviewModal";
import NoticeEditDialog from "../component/NoticeEditModal";

export default function NoticePreviewModal({
  open,
  onClose,
  notice,
  getAllNotice,
  updateNoticeLocal,
}: any) {
  const [editOpen, setEditOpen] = useState(false);

  // close all modals
  const handleCloseAll = useCallback(() => {
    setEditOpen(false);
    onClose?.();
  }, [onClose]);

  // reset edit modal when preview closes
  useEffect(() => {
    if (!open) setEditOpen(false);
  }, [open]);

  // reset when notice changes
  useEffect(() => {
    setEditOpen(false);
  }, [notice?._id]);

  const onNoticeUpdated = async (updatedNotice: any) => {
    // 1. Instant update (BEST UX)
    updateNoticeLocal(updatedNotice);

    // 2. Optional sync with backend
    await getAllNotice?.();
  };

  return (
    <>
      {/* PREVIEW */}
      <NoticePreviewDialog
        open={open}
        onClose={handleCloseAll}
        notice={notice}
        onEdit={() => setEditOpen(true)}
      />

      {/* EDIT */}
      <NoticeEditDialog
        open={editOpen}
        onClose={handleCloseAll}
        notice={notice}
        onNoticeUpdated={onNoticeUpdated}
      />
    </>
  );
}