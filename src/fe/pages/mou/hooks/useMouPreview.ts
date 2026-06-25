"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFilenameFromContentDisposition,
  sanitizeFilename,
  downloadBlob,
} from "../utils";

/**
 * Custom hook to handle MOU PDF preview and download logic.
 * @param id The ID of the MOU/Employee to preview.
 */
export const useMouPreview = (id: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/v0/mou/pdf/preview?id=${encodeURIComponent(id)}`,
          {
            credentials: "include",
          },
        );
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          let bodyText = await res.text();
          try {
            const json = JSON.parse(bodyText || "{}");
            const message =
              json.message ||
              json.detail ||
              bodyText ||
              `Request failed ${res.status}`;
            throw new Error(message);
          } catch (e) {
            throw new Error(bodyText || `Request failed ${res.status}`);
          }
        }

        if (ct.includes("application/pdf")) {
          const apiUrl = `/api/v0/mou/pdf/preview?id=${encodeURIComponent(id)}`;
          if (active) setIframeSrc(apiUrl);
        } else {
          const text = await res.text();
          try {
            const json = JSON.parse(text || "{}");
            const message = json.message || json.detail || JSON.stringify(json);
            throw new Error(message);
          } catch (e) {
            throw new Error(
              text || "Unexpected non-PDF response from preview API",
            );
          }
        }
      } catch (err: any) {
        if (active) setError(err?.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  /**
   * Handles the complete PDF download flow:
   * 1. Fetches the PDF blob.
   * 2. Resolves filename from headers or employee service.
   * 3. Triggers browser download.
   */
  const downloadPdf = useCallback(async () => {
    try {
      const resp = await fetch(
        `/api/v0/mou/pdf/preview?id=${encodeURIComponent(id)}`,
        {
          credentials: "include",
        },
      );
      if (!resp.ok) throw new Error(`Failed to fetch PDF: ${resp.status}`);
      const ct = resp.headers.get("content-type") || "";
      if (!ct.includes("application/pdf")) {
        const text = await resp.text();
        throw new Error(text || "Preview did not return a PDF");
      }
      const blob = await resp.blob();

      let fname = getFilenameFromContentDisposition(
        resp.headers.get("content-disposition") || "",
      );

      // Fallback: Fetch employee details to construct a filename
      if (!fname) {
        try {
          const empResp = await fetch(
            `/api/v0/employee/${encodeURIComponent(id)}`,
            { credentials: "include" },
          );
          if (empResp.ok) {
            const empJson = await empResp.json();
            const emp = empJson && (empJson.data || empJson);
            const rawName =
              emp &&
              (emp.name || emp.username || emp.employeeProfileId || emp._id)
                ? emp.name || emp.username || emp.employeeProfileId || emp._id
                : "preview";
            fname = `${sanitizeFilename(String(rawName))}MOU.pdf`;
          }
        } catch (e) {
          // ignore fallback fetch error
        }
      }

      if (!fname) fname = "preview.pdf";
      downloadBlob(blob, fname);
    } catch (e: any) {
      // If direct fetch fails, we try to open the iframe source in a new window as a last resort
      if (iframeSrc) {
        window.open(iframeSrc, "_blank");
      } else {
        console.error("Download failed:", e);
        throw e;
      }
    }
  }, [id, iframeSrc]);

  return {
    loading,
    error,
    iframeSrc,
    downloadPdf,
  };
};
