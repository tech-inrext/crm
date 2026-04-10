import React, { useState } from "react";
import NoticePreviewDialog from "../component/NoticePreviewModal";
import NoticeEditDialog from "../component/NoticeEditModal";

export default function NoticePreviewModal({
  open,
  onClose,
  notice,
}: any) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <NoticePreviewDialog
        open={open}
        onClose={onClose}
        notice={notice}
        onEdit={() => setEditOpen(true)}
      />

      <NoticeEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        notice={notice}
      />
    </>
  );
}