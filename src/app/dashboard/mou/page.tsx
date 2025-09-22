"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import Pagination from "@/components/ui/Pagination";
import PermissionGuard from "@/components/PermissionGuard";
import MouList from "@/components/mou/MouList";
import { useMou } from "@/hooks/useMou";
import axios from "axios";

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

  const [view, setView] = useState<"pending" | "completed">("pending");

  useEffect(() => {
    if (view === "pending") setStatus("Pending");
    else setStatus("Completed");
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
                      try {
                        await markStatus(id, "Approved");
                        await load(page, rowsPerPage, "", "Pending");
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    onReject={async (id) => {
                      try {
                        await markStatus(id, "Rejected");
                        await load(page, rowsPerPage, "", "Pending");
                      } catch (e) {
                        console.error(e);
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
      </Box>
    </PermissionGuard>
  );
};

export default MOUPage;
