"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  ButtonGroup,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Alert,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  Search,
  FilterList,
  Sort,
  Refresh,
  MarkAsUnread,
  Archive,
  Delete,
  CheckCircle,
  Info,
  Warning,
  Error as ErrorIcon,
  Notifications,
  NotificationsNone,
  Schedule,
  Person,
  Business,
  Assignment,
} from "@mui/icons-material";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNotificationActions } from "@/hooks/useNotifications";
import { formatDistanceToNow, format } from "date-fns";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

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

  const {
    notifications,
    unreadCount,
    loading,
    error,
    stats,
    forceRefresh,
  } = useNotifications();

  const {
    selectedIds,
    actionLoading,
    toggleSelection,
    selectAll,
    clearSelection,
    markSelectedAsRead,
    archiveSelected,
    deleteSelected,
    hasSelectedItems,
  } = useNotificationActions({
    onSuccess: (action, count) => {
      console.log(`Successfully ${action} ${count} notifications`);
      forceRefresh();
    },
    onError: (action, error) => {
      console.error(`Failed to ${action}:`, error);
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter notifications based on current criteria
  const filteredNotifications = notifications.filter((notification) => {
    // Search query filter
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus !== "all" && notification.lifecycle.status.toLowerCase() !== filterStatus) {
      return false;
    }

    // Type filter
    if (filterType !== "all" && notification.type !== filterType) {
      return false;
    }

    // Priority filter
    if (filterPriority !== "all" && notification.metadata.priority !== filterPriority) {
      return false;
    }

    // Unread filter
    if (showOnlyUnread && notification.lifecycle.status === "READ") {
      return false;
    }

    return true;
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "priority":
        const priorityOrder = { "URGENT": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
        comparison = (priorityOrder[a.metadata.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[b.metadata.priority as keyof typeof priorityOrder] || 0);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "error";
      case "HIGH": return "warning";
      case "MEDIUM": return "info";
      case "LOW": default: return "default";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT": return <ErrorIcon color="error" fontSize="small" />;
      case "HIGH": return <Warning color="warning" fontSize="small" />;
      case "MEDIUM": return <Info color="info" fontSize="small" />;
      case "LOW": default: return <CheckCircle color="action" fontSize="small" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "LEAD_ASSIGNED": return <Assignment color="primary" />;
      case "LEAD_STATUS_UPDATE": return <Business color="info" />;
      case "SYSTEM": return <Notifications color="action" />;
      default: return <Info color="action" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    if (!isClient) return "moments ago";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, "MMM dd, yyyy 'at' hh:mm a");
      }
    } catch {
      return "Unknown time";
    }
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);
  const paginatedNotifications = sortedNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    clearSelection();
    setPage(1);

    // Set filters based on tab
    switch (newValue) {
      case 0: // All
        setFilterStatus("all");
        setShowOnlyUnread(false);
        break;
      case 1: // Unread
        setShowOnlyUnread(true);
        break;
      case 2: // Read
        setFilterStatus("read");
        setShowOnlyUnread(false);
        break;
      case 3: // Archived
        setFilterStatus("archived");
        setShowOnlyUnread(false);
        break;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" fontWeight={600}>
          Notifications
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => forceRefresh()}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Refresh"}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Notifications color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {notifications.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NotificationsNone color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="error">
                    {unreadCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unread
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Schedule color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.todayCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.urgentCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Urgent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "type")}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="LEAD_ASSIGNED">Lead Assigned</MenuItem>
                  <MenuItem value="LEAD_STATUS_UPDATE">Status Update</MenuItem>
                  <MenuItem value="SYSTEM">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  label="Priority"
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Read" />
          <Tab label="Archived" />
        </Tabs>

        {/* Bulk Actions */}
        {hasSelectedItems && (
          <Box sx={{ p: 2, backgroundColor: "action.hover" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2">
                {selectedIds.length} notification{selectedIds.length !== 1 ? "s" : ""} selected
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MarkAsUnread />}
                onClick={() => markSelectedAsRead()}
                disabled={actionLoading === "mark as read"}
              >
                Mark as Read
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Archive />}
                onClick={() => archiveSelected()}
                disabled={actionLoading === "archive"}
              >
                Archive
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => deleteSelected()}
                disabled={actionLoading === "delete"}
              >
                Delete
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => clearSelection()}
              >
                Clear Selection
              </Button>
            </Box>
          </Box>
        )}

        <TabPanel value={tabValue} index={tabValue}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading notifications...
              </Typography>
            </Box>
          ) : paginatedNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NotificationsNone sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || filterType !== "all" || filterPriority !== "all"
                  ? "Try adjusting your filters or search query"
                  : "You're all caught up!"}
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0 }}>
                {paginatedNotifications.map((notification, index) => (
                  <React.Fragment key={notification._id}>
                    <ListItem
                      sx={{
                        backgroundColor:
                          notification.lifecycle.status === "READ"
                            ? "transparent"
                            : "action.hover",
                        borderLeft: notification.lifecycle.status !== "READ"
                          ? `4px solid`
                          : "4px solid transparent",
                        borderColor: notification.lifecycle.status !== "READ"
                          ? `${getPriorityColor(notification.metadata.priority)}.main`
                          : "transparent",
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedIds.includes(notification._id)}
                          onChange={() => toggleSelection(notification._id)}
                        />
                      </ListItemIcon>

                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getTypeIcon(notification.type)}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography
                              variant="h6"
                              fontWeight={
                                notification.lifecycle.status !== "READ" ? 600 : 400
                              }
                              sx={{ flex: 1 }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip
                              icon={getPriorityIcon(notification.metadata.priority)}
                              label={notification.metadata.priority}
                              size="small"
                              color={getPriorityColor(notification.metadata.priority) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                        secondary={
                          <>
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Chip
                                label={notification.type.replace(/_/g, " ")}
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.disabled">
                                {formatNotificationTime(notification.createdAt)}
                              </Typography>
                              {notification.sender && (
                                <Typography variant="caption" color="text.disabled">
                                  from {notification.sender.name}
                                </Typography>
                              )}
                              <Chip
                                label={notification.lifecycle.status}
                                size="small"
                                color={
                                  notification.lifecycle.status === "READ"
                                    ? "default"
                                    : "primary"
                                }
                                variant="filled"
                              />
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    {index < paginatedNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

export default NotificationsPage;