import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

export const useNoticeForm = (notice: any) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    expiry: null as Dayjs | null,
    pinned: false,
  });

  useEffect(() => {
    if (notice) {
      setForm({
        title: notice.title || "",
        description: notice.description || "",
        category: notice.category || "",
        priority: notice.priority || "",
        expiry: notice.expiry ? dayjs(notice.expiry) : null,
        pinned: notice.pinned || false,
      });
    }
  }, [notice]);

  return { form, setForm };
};
