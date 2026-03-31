"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@/components/ui/Component";
import Pagination from "@/components/ui/Navigation/Pagination";
import PermissionGuard from "@/components/PermissionGuard";
import MouList from "@/fe/pages/mou/components/MouList";
import { useMouPage } from "@/fe/pages/mou/hooks/useMouPage";

const MOUPage: React.FC = () => {
  const {
    items,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    view,
    setView,
    handleApprove,
    handleReject,
    handleResend,
    handleMarkComplete,
    snackOpen,
    setSnackOpen,
    snackMsg,
    snackSeverity,
  } = useMouPage();

  return (
    <PermissionGuard module="mou">
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 2, sm: 3, md: 4 },
          minHeight: "100vh",
          bgcolor: "background.default",
          width: "100%",
          overflow: "hidden",
        }}
      >
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

        {loading ? (
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
                    loading={loading}
                    view={view}
                    onMarkComplete={handleMarkComplete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onResend={handleResend}
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
