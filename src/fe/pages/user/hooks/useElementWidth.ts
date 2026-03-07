"use client";
import { useEffect, useState } from "react";

export function useElementWidth<T extends HTMLElement>(
  ref: React.RefObject<T>,
) {
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      const measure = () => {
        if (ref.current) setWidth(ref.current.getBoundingClientRect().width);
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const obs = new ResizeObserver((entries) => {
      for (const e of entries)
        if (e.target === ref.current) setWidth(e.contentRect.width);
    });

    if (ref.current) obs.observe(ref.current as Element);
    return () => obs.disconnect();
  }, [ref]);

  return width;
}

export default useElementWidth;
