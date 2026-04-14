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
import MouActionBar from "@/fe/pages/mou/components/MouActionBar";
import { useMouPage } from "@/fe/pages/mou/hooks/useMouPage";
import { Tabs, Tab, Badge } from "@/components/ui/Component";
import {
  containerSx,
  loadingContainerSx,
  contentGridSx,
  listPaperSx,
  listTitleSx,
  paginationContainerSx,
  tabsWrapperSx,
  tabsSx,
  tabSx,
  tabLabelBoxSx,
  badgeTypographySx,
  tabTextTypographySx,
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
    search,
    handleSearchChange,
    pendingCount,
    completedCount,
  } = useMouPage();

  const handleTabChange = (_: React.SyntheticEvent, newValue: "pending" | "completed") => {
    setView(newValue);
  };

  return (
    <PermissionGuard module="mou">
      <Box sx={containerSx}>
        <MouActionBar
          search={search}
          onSearchChange={handleSearchChange}
        />

        <Box sx={tabsWrapperSx}>
          <Tabs 
            value={view} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={tabsSx}
          >
            <Tab 
              value="pending" 
              disableRipple
              sx={tabSx}
              label={
                <Box sx={tabLabelBoxSx}>
                  <Typography 
                    variant="caption" 
                    sx={badgeTypographySx("error")}
                  >
                    {pendingCount}
                  </Typography>
                  <Typography variant="body2" sx={tabTextTypographySx}>PENDING</Typography>
                </Box>
              }
            />
            <Tab 
              value="completed" 
              disableRipple
              sx={tabSx}
              label={
                <Box sx={tabLabelBoxSx}>
                  <Typography 
                    variant="caption" 
                    sx={badgeTypographySx("success")}
                  >
                    {completedCount}
                  </Typography>
                  <Typography variant="body2" sx={tabTextTypographySx}>COMPLETED</Typography>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={loadingContainerSx}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={contentGridSx}>
            <Paper sx={listPaperSx} elevation={1}>
              <Typography variant="h6" sx={listTitleSx}>
                {view === "completed"
                  ? `Completed MOU (${items.length})`
                  : `Pending MOU (${items.length})`}
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
      </Box>
    </PermissionGuard>
  );
};

export default MOUPage;
