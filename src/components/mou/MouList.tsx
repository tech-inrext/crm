"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Divider,
  Check,
} from "@/components/ui/Component";

interface MouListProps {
  items: any[];
  loading: boolean;
  onMarkComplete: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onResend?: (id: string) => Promise<void>;
  view?: "pending" | "completed";
}

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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

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
            <Paper
              sx={{
                p: 4,
                position: "relative",
                borderRadius: 3,
                minHeight: 170,
                transition: "transform 150ms ease, box-shadow 150ms ease",
                "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              elevation={1}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 56,
                        height: 56,
                        fontSize: 18,
                      }}
                    >
                      {String(emp.name || "")
                        .split(" ")
                        .map((s: string) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                        {emp.name}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}
                      >
                        {emp.email}
                      </Typography>
                      {emp.designation && (
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: 13,
                            mt: 0.5,
                          }}
                        >
                          {emp.designation}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      pt: 1,
                    }}
                  >
                    {/** Show different actions based on view */}
                    {/** default to pending actions */}
                    {(!view || view === "pending") && (
                      <>
                        <Button
                          type="button"
                          size="medium"
                          color="success"
                          variant="contained"
                          startIcon={<Check fontSize="small" />}
                          onClick={() => {
                            if (!emp._id) return;
                            openConfirm("approve", emp._id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 140,
                            borderRadius: 2,
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="medium"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            if (!emp._id) return;
                            openConfirm("reject", emp._id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 120,
                            borderRadius: 2,
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {view === "completed" && (
                      <>
                        <Button
                          type="button"
                          size="medium"
                          variant="outlined"
                          onClick={() => {
                            if (!emp._id) return;
                            setPreviewId(emp._id);
                            setPreviewOpen(true);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 120,
                            borderRadius: 2,
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          type="button"
                          size="medium"
                          color="primary"
                          variant="contained"
                          onClick={() => {
                            if (!emp._id) return;
                            if (onResend) onResend(emp._id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            minWidth: 140,
                            borderRadius: 2,
                          }}
                        >
                          Resend Mail
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              <Chip
                label={emp.mouStatus || "-"}
                color={emp.mouStatus === "Completed" ? "success" : "warning"}
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              />
            </Paper>
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
          }
        );
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          // Try parse JSON error body
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
          // try to get filename from Content-Disposition header
          try {
            const cd = res.headers.get("content-disposition") || "";
            let name: string | null = null;
            const fnStarMatch = cd.match(
              /filename\*=(?:UTF-8'')?([^;\n\r\"]+)/i
            );
            const fnMatch = cd.match(/filename=\"([^\"]+)\"/i);
            if (fnStarMatch && fnStarMatch[1]) {
              try {
                name = decodeURIComponent(fnStarMatch[1]);
              } catch (e) {
                name = fnStarMatch[1];
              }
            } else if (fnMatch && fnMatch[1]) {
              name = fnMatch[1];
            }
            if (name) {
              const cleaned = name.replace(/\s+/g, "");
              console.debug(
                "PreviewLoader: Content-Disposition header:",
                cd,
                "-> filename:",
                cleaned
              );
              setFilename(cleaned);
            } else {
              console.debug(
                "PreviewLoader: no filename in Content-Disposition:",
                cd
              );
            }
          } catch (e) {
            // ignore parsing errors
          }
          // use direct API URL for iframe so built-in PDF viewer uses server headers
          const apiUrl = `/api/v0/mou/pdf/preview?id=${encodeURIComponent(id)}`;
          if (active) setIframeSrc(apiUrl);
        } else {
          // Non-PDF response - treat as error and show message
          const text = await res.text();
          try {
            const json = JSON.parse(text || "{}");
            const message = json.message || json.detail || JSON.stringify(json);
            throw new Error(message);
          } catch (e) {
            throw new Error(
              text || "Unexpected non-PDF response from preview API"
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
                // Fetch PDF blob directly so we can control the download filename
                const resp = await fetch(
                  `/api/v0/mou/pdf/preview?id=${encodeURIComponent(id)}`,
                  {
                    credentials: "include",
                  }
                );
                if (!resp.ok)
                  throw new Error(`Failed to fetch PDF: ${resp.status}`);
                const ct = resp.headers.get("content-type") || "";
                if (!ct.includes("application/pdf")) {
                  const text = await resp.text();
                  throw new Error(text || "Preview did not return a PDF");
                }
                const blob = await resp.blob();

                // try to obtain filename from response
                let fname: string | null = null;
                try {
                  const cd = resp.headers.get("content-disposition") || "";
                  console.debug("Download: Content-Disposition:", cd);
                  const fnStarMatch = cd.match(
                    /filename\*=(?:UTF-8'')?([^;\n\r\"]+)/i
                  );
                  const fnMatch = cd.match(/filename=\"([^\"]+)\"/i);
                  if (fnStarMatch && fnStarMatch[1]) {
                    try {
                      fname = decodeURIComponent(fnStarMatch[1]);
                    } catch (e) {
                      fname = fnStarMatch[1];
                    }
                  } else if (fnMatch && fnMatch[1]) {
                    fname = fnMatch[1];
                  }
                  if (fname)
                    console.debug("Download: parsed filename ->", fname);
                } catch (e) {
                  console.debug("Download: filename parse failed", e);
                }

                // fallback: fetch employee record to construct filename
                if (!fname) {
                  try {
                    const empResp = await fetch(
                      `/api/v0/employee/${encodeURIComponent(id)}`,
                      { credentials: "include" }
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
                      const sanitized =
                        String(rawName)
                          .replace(/[^\x00-\x7F]/g, "")
                          .replace(/[^a-zA-Z0-9 _\-\.]/g, "")
                          .replace(/\s+/g, "")
                          .trim() || "preview";
                      fname = `${sanitized}MOU.pdf`;
                    }
                  } catch (e) {
                    // ignore
                  }
                }

                if (!fname) fname = "preview.pdf";

                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = fname;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(downloadUrl);
              } catch (e) {
                // fallback: open iframe or blob in new tab
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
