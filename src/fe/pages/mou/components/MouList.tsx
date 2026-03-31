"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from "@/components/ui/Component";
import { MouListProps } from "../types";
import MouCard from "./MouCard";
import {
  getFilenameFromContentDisposition,
  sanitizeFilename,
  downloadBlob,
} from "../utils";


const MouList: React.FC<MouListProps> = ({
  items,
  loading,
  onMarkComplete,
  onApprove,
  onReject,
  onResend,
  view,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    id: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const openConfirm = (type: "approve" | "reject", id: string) => {
    setPendingAction({ type, id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { type, id } = pendingAction;
    setConfirmOpen(false);
    try {
      if (type === "approve" && onApprove) await onApprove(id);
      if (type === "reject" && onReject) await onReject(id);
    } catch (e) {
      // caller handles notifications
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };
  return (
    <Box>
      <Grid container spacing={2}>
        {items.map((emp) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={emp._id}>
            <MouCard
              emp={emp}
              view={view}
              onApproveConfirm={(id) => openConfirm("approve", id)}
              onRejectConfirm={(id) => openConfirm("reject", id)}
              onPreview={(id) => {
                setPreviewId(id);
                setPreviewOpen(true);
              }}
              onResend={onResend}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog open={confirmOpen} onClose={handleCancel} fullWidth maxWidth="lg">
        <DialogTitle>
          {pendingAction?.type === "approve"
            ? "Preview & Confirm Approve"
            : "Confirm Reject"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {pendingAction?.type === "approve" ? (
            <Box sx={{ width: "100%", height: "70vh" }}>
              {pendingAction?.id && <PreviewLoader id={pendingAction.id} />}
            </Box>
          ) : (
            <DialogContentText>
              Are you sure you want to reject this MOU? This action cannot be
              undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          {pendingAction?.type === "approve" && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", mr: "auto", pl: 1 }}
            >
              Note: Confirm will send email to associate with MOU pdf
            </Typography>
          )}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="button"
            onClick={handleConfirm}
            color={pendingAction?.type === "approve" ? "success" : "error"}
            variant={
              pendingAction?.type === "approve" ? "contained" : "outlined"
            }
          >
            {pendingAction?.type === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>MOU Preview</DialogTitle>
        <DialogContent sx={{ height: "80vh" }}>
          {previewId && <PreviewLoader id={previewId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Small inline component to fetch the preview and handle errors
const PreviewLoader: React.FC<{ id: string }> = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

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
          try {
            const cd = res.headers.get("content-disposition") || "";
            const name = getFilenameFromContentDisposition(cd);
            if (name) {
              setFilename(name);
            } else {
              console.debug(
                "PreviewLoader: no filename in Content-Disposition:",
                cd,
              );
            }
          } catch (e) {
            // ignore parsing errors
          }
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
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [id]);

  if (loading)
    return <Box sx={{ width: "100%", height: "100%" }}>Loading preview…</Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (iframeSrc || blobUrl)
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1 }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={async () => {
              try {
                const resp = await fetch(
                  `/api/v0/mou/pdf/preview?id=${encodeURIComponent(id)}`,
                  {
                    credentials: "include",
                  },
                );
                if (!resp.ok)
                  throw new Error(`Failed to fetch PDF: ${resp.status}`);
                const ct = resp.headers.get("content-type") || "";
                if (!ct.includes("application/pdf")) {
                  const text = await resp.text();
                  throw new Error(text || "Preview did not return a PDF");
                }
                const blob = await resp.blob();

                let fname = getFilenameFromContentDisposition(
                  resp.headers.get("content-disposition") || "",
                );

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
                        (emp.name ||
                          emp.username ||
                          emp.employeeProfileId ||
                          emp._id)
                          ? emp.name ||
                            emp.username ||
                            emp.employeeProfileId ||
                            emp._id
                          : "preview";
                      fname = `${sanitizeFilename(String(rawName))}MOU.pdf`;
                    }
                  } catch (e) {
                    // ignore
                  }
                }

                if (!fname) fname = "preview.pdf";
                downloadBlob(blob, fname);
              } catch (e) {
                if (iframeSrc) window.open(iframeSrc, "_blank");
                else if (blobUrl) window.open(blobUrl, "_blank");
                else console.error(e);
              }
            }}
          >
            Download
          </Button>
        </Box>
        <iframe
          title="MOU Preview"
          src={iframeSrc || blobUrl || undefined}
          style={{ width: "100%", height: "100%", border: "none", flex: 1 }}
        />
      </Box>
    );
  return null;
};

export default MouList;
