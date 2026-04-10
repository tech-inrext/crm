import { useEffect, useState } from "react";
import axios from "axios";

export const useNoticeMeta = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v0/notice/meta");

        if (res.data?.success) {
          setCategories(res.data.data?.categories || []);
          setPriorities(res.data.data?.priorities || []);
        }
      } catch (err) {
        console.error("Meta fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { categories, priorities, loading };
};