import { useEffect, useState } from "react";
import axios from "axios";

let cachedMeta = null; // ✅ GLOBAL CACHE
let isFetching = false;
let subscribers = [];

const notifySubscribers = (data) => {
  subscribers.forEach((cb) => cb(data));
};

export const useNoticeMeta = () => {
  const [data, setData] = useState(cachedMeta);

  useEffect(() => {
    subscribers.push(setData);

    // if already cached → no API call
    if (cachedMeta) {
      setData(cachedMeta);
      return;
    }

    const fetchMeta = async () => {
      if (isFetching) return; // 🚫 prevent duplicate calls

      try {
        isFetching = true;

        const res = await axios.get("/api/v0/notice/meta");

        if (res.data?.success) {
          cachedMeta = {
            categories: res.data.data?.categories || [],
            priorities: res.data.data?.priorities || [],
          };

          notifySubscribers(cachedMeta);
        }
      } catch (err) {
        console.error("Meta fetch error:", err);
      } finally {
        isFetching = false;
      }
    };

    fetchMeta();

    return () => {
      subscribers = subscribers.filter((s) => s !== setData);
    };
  }, []);

  return {
    categories: data?.categories || [],
    priorities: data?.priorities || [],
    loading: !data,
  };
};