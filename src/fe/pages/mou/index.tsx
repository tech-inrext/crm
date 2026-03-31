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
import {
  containerSx,
  headerPaperSx,
  headerContentSx,
  titleSx,
  tabButtonsContainerSx,
  loadingContainerSx,
  contentGridSx,
  listPaperSx,
  listTitleSx,
  paginationContainerSx,
} from "./styles";

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
      <Box sx={containerSx}>
        <Paper sx={headerPaperSx} elevation={2}>
          <Box sx={headerContentSx}>
            <Typography variant="h4" sx={titleSx}>
              MOU
            </Typography>
            <Box />
          </Box>
        </Paper>

        <Box sx={tabButtonsContainerSx}>
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
          <Box sx={loadingContainerSx}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={contentGridSx}>
            <Paper sx={listPaperSx} elevation={1}>
              <Typography variant="h6" sx={listTitleSx}>
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

                  <Box sx={paginationContainerSx}>
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
