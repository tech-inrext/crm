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
import { useNotifications } from "../../../contexts/NotificationContext";
import { useNotificationActions } from "../../../hooks/useNotifications";
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

  const { notifications, unreadCount, loading, error, stats, forceRefresh } =
    useNotifications();

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
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (
      filterStatus !== "all" &&
      notification.lifecycle.status.toLowerCase() !== filterStatus
    ) {
      return false;
    }

    // Type filter
    if (filterType !== "all" && notification.type !== filterType) {
      return false;
    }

    // Priority filter
    if (
      filterPriority !== "all" &&
      notification.metadata.priority !== filterPriority
    ) {
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
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "priority":
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison =
          (priorityOrder[a.metadata.priority as keyof typeof priorityOrder] ||
            0) -
          (priorityOrder[b.metadata.priority as keyof typeof priorityOrder] ||
            0);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <ErrorIcon color="error" fontSize="small" />;
      case "HIGH":
        return <Warning color="warning" fontSize="small" />;
      case "MEDIUM":
        return <Info color="info" fontSize="small" />;
      case "LOW":
      default:
        return <CheckCircle color="action" fontSize="small" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "LEAD_ASSIGNED":
        return <Assignment color="primary" />;
      case "LEAD_STATUS_UPDATE":
        return <Business color="info" />;
      case "SYSTEM":
        return <Notifications color="action" />;
      default:
        return <Info color="action" />;
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
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={600}
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
        >
          Notifications
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => forceRefresh()}
          disabled={loading}
          fullWidth={false}
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: 0, sm: 120 },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Refresh"}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid
        container
        spacing={{ xs: 1, sm: 2, md: 2.5 }}
        sx={{
          mb: { xs: 2, sm: 3 },
          width: "100%",
          mx: 0,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        <Grid
          item
          xs={3}
          sm={3}
          md={3}
          sx={{ maxWidth: { md: 280, lg: 320, xl: 350 } }}
        >
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 1.5 },
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Notifications
                  color="primary"
                  sx={{ fontSize: { xs: 32, sm: 48 } }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, mb: 0.5 }}
                  >
                    {notifications.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          item
          xs={3}
          sm={3}
          md={3}
          sx={{ maxWidth: { md: 280, lg: 320, xl: 350 } }}
        >
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 1.5 },
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <NotificationsNone
                  color="error"
                  sx={{ fontSize: { xs: 32, sm: 48 } }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="error.main"
                    sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, mb: 0.5 }}
                  >
                    {unreadCount}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Unread
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          item
          xs={3}
          sm={3}
          md={3}
          sx={{ maxWidth: { md: 280, lg: 320, xl: 350 } }}
        >
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 1.5 },
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Schedule
                  color="warning"
                  sx={{ fontSize: { xs: 32, sm: 48 } }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, mb: 0.5 }}
                  >
                    {stats?.todayCount || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          item
          xs={3}
          sm={3}
          md={3}
          sx={{ maxWidth: { md: 280, lg: 320, xl: 350 } }}
        >
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 1.5 },
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <ErrorIcon
                  color="error"
                  sx={{ fontSize: { xs: 32, sm: 48 } }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, mb: 0.5 }}
                  >
                    {stats?.urgentCount || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Urgent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: { xs: 2, sm: 3 }, overflow: "visible" }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  backgroundColor: "background.default",
                },
              }}
            />

            {/* Filter Controls Row */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  mr: 1,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Sort By:
              </Typography>
              <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
                <InputLabel
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  Date
                </InputLabel>
                <Select
                  value={sortBy}
                  label="Date"
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "priority" | "type")
                  }
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
                <InputLabel
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  Order
                </InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  <MenuItem value="desc">Newest</MenuItem>
                  <MenuItem value="asc">Oldest</MenuItem>
                </Select>
              </FormControl>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" }, mx: 1 }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  mr: 1,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Filters:
              </Typography>

              <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 130 } }}>
                <InputLabel
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  Type
                </InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="LEAD_ASSIGNED">Lead Assigned</MenuItem>
                  <MenuItem value="LEAD_STATUS_UPDATE">Status Update</MenuItem>
                  <MenuItem value="SYSTEM">System</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 140 } }}>
                <InputLabel
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  Priority
                </InputLabel>
                <Select
                  value={filterPriority}
                  label="Priority"
                  onChange={(e) => setFilterPriority(e.target.value)}
                  sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card
        sx={{ overflow: "visible", bgcolor: "background.paper", width: "100%" }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
              minWidth: { xs: 80, sm: 100, md: 120 },
              px: { xs: 1, sm: 2 },
            },
          }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Read" />
          <Tab label="Archived" />
        </Tabs>

        {/* Bulk Actions */}
        {hasSelectedItems && (
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              backgroundColor: { xs: "action.selected", sm: "action.hover" },
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  width: { xs: "100%", sm: "auto" },
                  mb: { xs: 1, sm: 0 },
                }}
              >
                {selectedIds.length} notification
                {selectedIds.length !== 1 ? "s" : ""} selected
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MarkAsUnread fontSize="small" />}
                onClick={() => markSelectedAsRead()}
                disabled={actionLoading === "mark as read"}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: 0.75 },
                }}
              >
                Mark as Read
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Archive fontSize="small" />}
                onClick={() => archiveSelected()}
                disabled={actionLoading === "archive"}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: 0.75 },
                }}
              >
                Archive
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete fontSize="small" />}
                onClick={() => deleteSelected()}
                disabled={actionLoading === "delete"}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: 0.75 },
                }}
              >
                Delete
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => clearSelection()}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: 0.75 },
                  ml: { xs: 0, sm: "auto" },
                }}
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
              <NotificationsNone
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
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
                        width: "100%",
                        display: "flex",
                        flexDirection: { xs: "row", sm: "row" },
                        alignItems: "flex-start",
                        backgroundColor:
                          notification.lifecycle.status === "READ"
                            ? "transparent"
                            : {
                                xs: "rgba(25, 118, 210, 0.08)",
                                sm: "action.hover",
                              },
                        borderLeft:
                          notification.lifecycle.status !== "READ"
                            ? { xs: "3px solid", sm: "4px solid" }
                            : {
                                xs: "3px solid transparent",
                                sm: "4px solid transparent",
                              },
                        borderColor:
                          notification.lifecycle.status !== "READ"
                            ? `${getPriorityColor(
                                notification.metadata.priority
                              )}.main`
                            : "transparent",
                        py: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 0.5, sm: 1.5, md: 2 },
                        gap: { xs: 0.5, sm: 1 },
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          backgroundColor:
                            notification.lifecycle.status === "READ"
                              ? "action.hover"
                              : "action.selected",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: { xs: 32, sm: 40 },
                          mt: 0.5,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={selectedIds.includes(notification._id)}
                          onChange={() => toggleSelection(notification._id)}
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        />
                      </ListItemIcon>

                      <ListItemIcon
                        sx={{
                          minWidth: { xs: 32, sm: 40 },
                          mt: 0.5,
                          display: { xs: "none", sm: "flex" },
                        }}
                      >
                        {getTypeIcon(notification.type)}
                      </ListItemIcon>

                      <ListItemText
                        sx={{ flex: 1, minWidth: 0, my: 0 }}
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: { xs: 0.5, sm: 1 },
                              mb: { xs: 0.5, sm: 1 },
                              flexWrap: "wrap",
                              width: "100%",
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={
                                notification.lifecycle.status !== "READ"
                                  ? 600
                                  : 400
                              }
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: {
                                  xs: "0.875rem",
                                  sm: "1rem",
                                  md: "1.125rem",
                                },
                                lineHeight: { xs: 1.3, sm: 1.5 },
                                wordBreak: "break-word",
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip
                              icon={getPriorityIcon(
                                notification.metadata.priority
                              )}
                              label={notification.metadata.priority}
                              size="small"
                              color={
                                getPriorityColor(
                                  notification.metadata.priority
                                ) as any
                              }
                              variant="outlined"
                              sx={{
                                height: { xs: 20, sm: 24 },
                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                "& .MuiChip-icon": {
                                  fontSize: { xs: 12, sm: 14 },
                                },
                              }}
                            />
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: { xs: 0.5, sm: 1 },
                                wordBreak: "break-word",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                lineHeight: { xs: 1.4, sm: 1.6 },
                                display: "-webkit-box",
                                WebkitLineClamp: { xs: 2, sm: 3 },
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 0.5, sm: 1 },
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                label={notification.type.replace(/_/g, " ")}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: { xs: 18, sm: 24 },
                                  fontSize: { xs: "0.625rem", sm: "0.75rem" },
                                  display: { xs: "none", sm: "inline-flex" },
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{
                                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                }}
                              >
                                {formatNotificationTime(notification.createdAt)}
                              </Typography>
                              {notification.sender && (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                  sx={{
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                    display: { xs: "none", sm: "inline" },
                                  }}
                                >
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
                                sx={{
                                  height: { xs: 18, sm: 24 },
                                  fontSize: { xs: "0.625rem", sm: "0.75rem" },
                                }}
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
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    color="primary"
                    size="medium"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        minWidth: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                      },
                    }}
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
