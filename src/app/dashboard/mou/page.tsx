"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@/components/ui/Component";
import { Dialog } from "@/components/ui/Component";
import Pagination from "@/components/ui/Navigation/Pagination";
import PermissionGuard from "@/components/PermissionGuard";
import MouList from "@/components/mou/MouList";
import { useMou } from "@/hooks/useMou";
import axios from "axios";
import { Snackbar, Alert } from "@/components/ui/Component";

const MOUPage: React.FC = () => {
  const {
    items,
    loading: mouLoading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    status,
    setStatus,
    setSearch,
    markStatus,
    load,
  } = useMou("Pending");

  const router = useRouter();

  const [view, setView] = useState<"pending" | "completed">("pending");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    if (view === "pending") setStatus("Pending");
    else setStatus("Approved");
    setPage(1);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <PermissionGuard module="mou">
      <Box style={{ marginTop: 24 }} className="container mx-auto px-4 py-6">
        <Paper sx={{ p: 2, mb: 2 }} elevation={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              MOU
            </Typography>
            <Box />
          </Box>
        </Paper>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            variant={view === "pending" ? "contained" : "outlined"}
            onClick={() => setView("pending")}
          >
            Pending MOU
          </Button>
          <Button
            variant={view === "completed" ? "contained" : "outlined"}
            onClick={() => setView("completed")}
          >
            Completed MOU
          </Button>
        </Box>

        {mouLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {view === "pending"
                  ? `Pending MOU (${items.length})`
                  : `Completed MOU (${items.length})`}
              </Typography>
              {items.length === 0 ? (
                <Typography>
                  {view === "pending"
                    ? "No pending MOUs."
                    : "No completed MOUs."}
                </Typography>
              ) : (
                <>
                  <MouList
                    items={items}
                    loading={mouLoading}
                    view={view}
                    onMarkComplete={async (id) => {
                      try {
                        if (view === "pending") {
                          await markStatus(id, "Completed");
                          // after marking complete, refresh list
                          await load(page, rowsPerPage, "", "Pending");
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    onApprove={async (id) => {
                      // optimistic update: remove from pending list immediately
                      try {
                        await markStatus(id, "Approved");

                        // call server endpoint which will set status, upload PDF and send email
                        await axios.post(`/api/v0/mou/approve-and-send/${id}`);

                        // Keep the current view (Pending) — do not auto-switch to Completed.
                        // Notify user of success.
                        setSnackMsg("MOU approved and email sent to associate");
                        setSnackSeverity("success");
                        setSnackOpen(true);
                      } catch (e) {
                        console.error("approve failed", e);
                        // rollback local optimistic change by reloading pending list
                        try {
                          await load(page, rowsPerPage, "", "Pending");
                        } catch (err) {
                          console.error(
                            "failed to reload pending list after rollback",
                            err
                          );
                        }
                        setSnackMsg("Failed to approve MOU");
                        setSnackSeverity("error");
                        setSnackOpen(true);
                      }
                      return;
                    }}
                    onReject={async (id) => {
                      try {
                        await markStatus(id, "Rejected");
                        await load(page, rowsPerPage, "", "Pending");
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    onResend={async (id) => {
                      try {
                        const resp = await axios.post(
                          `/api/v0/mou/resend-mail/${id}`
                        );
                        if (resp.data && resp.data.success) {
                          setSnackMsg("Mail has been sent");
                          setSnackSeverity("success");
                          setSnackOpen(true);
                        } else {
                          setSnackMsg("Failed to send mail");
                          setSnackSeverity("error");
                          setSnackOpen(true);
                        }
                      } catch (e) {
                        console.error("resend-mail failed", e);
                        setSnackMsg("Failed to send mail");
                        setSnackSeverity("error");
                        setSnackOpen(true);
                      }
                    }}
                  />

                  <Box sx={{ mt: 2 }}>
                    <Pagination
                      page={page}
                      pageSize={rowsPerPage}
                      total={totalItems}
                      onPageChange={(p) => setPage(p)}
                      onPageSizeChange={(s) => {
                        setRowsPerPage(s);
                        setPage(1);
                      }}
                    />
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        )}

        {/* AddRoleDialog removed from MOU page per request */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => setSnackOpen(false)}
        >
          <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)}>
            {snackMsg}
          </Alert>
        </Snackbar>
      </Box>
    </PermissionGuard>
  );
};

export default MOUPage;
