"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useNotificationActions } from "../../../hooks/useNotifications";
import { NotificationStats, CustomPagination } from "./components";
import { FilterControls } from "./FilterControls";
import { NotificationList } from "./NotificationList";
import { filterNotifications, sortNotifications } from "./utils";

const NotificationsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [isClient, setIsClient] = useState(false);

  const { notifications, unreadCount, loading, error, stats, forceRefresh } =
    useNotifications();
  const { selectedIds, toggleSelection, markSelectedAsRead } =
    useNotificationActions({
      onSuccess: () => forceRefresh(),
      onError: (action, error) => console.error(`Failed to ${action}:`, error),
    });

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (notification.lifecycle.status !== "READ") {
      await markSelectedAsRead();
    }

    if (notification.metadata?.actionUrl) {
      const leadMatch = notification.metadata.actionUrl.match(
        /\/dashboard\/leads\/([a-zA-Z0-9]+)$/
      );
      if (leadMatch) {
        router.push(`/dashboard/leads?openDialog=true&leadId=${leadMatch[1]}`);
      } else {
        router.push(notification.metadata.actionUrl);
      }
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    const tabFilters = [
      { filterStatus: "all", showOnlyUnread: false },
      { filterStatus: "all", showOnlyUnread: true },
      { filterStatus: "read", showOnlyUnread: false },
      { filterStatus: "archived", showOnlyUnread: false },
    ];
    const selected = tabFilters[newValue];
    setFilterStatus(selected.filterStatus);
    setShowOnlyUnread(selected.showOnlyUnread);
  };

  const filteredAndSorted = sortNotifications(
    filterNotifications(notifications, {
      searchQuery,
      filterStatus,
      filterType,
      filterPriority,
      showOnlyUnread,
    }),
    sortBy,
    sortOrder
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedNotifications = filteredAndSorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="p-2 sm:p-3 max-w-full overflow-hidden">
      <div className="mb-3 flex justify-between items-center flex-col sm:flex-row gap-2 w-full">
        <Typography variant="h4" className="font-semibold text-2xl sm:text-3xl">
          Notifications
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => forceRefresh()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Refresh"}
        </Button>
      </div>

      <NotificationStats
        total={notifications.length}
        unread={unreadCount}
        today={stats?.todayCount || 0}
        urgent={stats?.urgentCount || 0}
      />

      <FilterControls
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        filterType={filterType}
        filterPriority={filterPriority}
        onSearchChange={setSearchQuery}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onFilterTypeChange={setFilterType}
        onFilterPriorityChange={setFilterPriority}
      />

      {error && (
        <Alert severity="error" className="mb-3">
          {error}
        </Alert>
      )}

      <Card className="overflow-visible bg-white w-full">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b border-gray-200"
        >
          <Tab
            label={`All (${notifications.length})`}
            className="text-xs sm:text-sm"
          />
          <Tab
            label={`Unread (${unreadCount})`}
            className="text-xs sm:text-sm"
          />
          <Tab label="Read" className="text-xs sm:text-sm" />
          <Tab label="Archived" className="text-xs sm:text-sm" />
        </Tabs>

        <div className="pt-3">
          <NotificationList
            notifications={paginatedNotifications}
            selectedIds={selectedIds}
            isClient={isClient}
            loading={loading}
            onToggleSelection={toggleSelection}
            onNotificationClick={handleNotificationClick}
          />

          <CustomPagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
};

export default NotificationsPage;
