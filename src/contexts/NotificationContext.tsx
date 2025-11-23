"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    email: string;
  };
  type: string;
  title: string;
  message: string;
  lifecycle: {
    status: "PENDING" | "DELIVERED" | "READ" | "ARCHIVED" | "EXPIRED";
    readAt?: Date;
    readFromDevice?: "WEB" | "MOBILE" | "EMAIL";
    actionTaken?: boolean;
    actionTakenAt?: Date;
    actionType?: "CLICKED" | "DISMISSED" | "ACTED_UPON" | "IGNORED";
  };
  metadata: {
    leadId?: string;
    cabBookingId?: string;
    vendorBookingId?: string;
    propertyId?: string;
    userId?: string;
    actionUrl?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    isActionable?: boolean;
  };
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
  recentCount: number;
  typeBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Filters
  filters: {
    status?: string;
    type?: string;
    priority?: string;
  };

  // Actions
  fetchNotifications: (page?: number, filters?: any) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[], context?: any) => Promise<void>;
  markAllAsRead: (filters?: any) => Promise<void>;
  archiveNotifications: (notificationIds: string[]) => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  refreshStats: () => Promise<void>;
  setFilters: (filters: any) => void;
  clearError: () => void;

  // Real-time
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;

  // Force refresh
  forceRefresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Track previous unread count to detect new notifications
  const prevUnreadCountRef = useRef(unreadCount);

  // Filters
  const [filters, setFiltersState] = useState({
    status: undefined,
    type: undefined,
    priority: undefined,
  });

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setFilters = useCallback((newFilters: any) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    setNotifications([]);
  }, []);

  // Fetch notifications with pagination and filters
  const fetchNotifications = useCallback(
    async (page = 1, customFilters = {}) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Filter out undefined values before creating query params
        const allFilters = { ...filters, ...customFilters };
        const cleanFilters: Record<string, string> = {};

        Object.entries(allFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            cleanFilters[key] = String(value);
          }
        });

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          ...cleanFilters,
        });

        const response = await axios.get(
          `/api/v0/notifications?${queryParams}`
        );

        if (response.data.success) {
          const { notifications: newNotifications, pagination } =
            response.data.data;

          if (page === 1) {
            setNotifications(newNotifications);
          } else {
            setNotifications((prev) => [...prev, ...newNotifications]);
          }

          setCurrentPage(pagination.page);
          setTotalPages(pagination.pages);
          setHasMore(pagination.page < pagination.pages);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [user, filters]
  );

  // Load more notifications
  const loadMoreNotifications = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchNotifications(currentPage + 1);
    }
  }, [hasMore, loading, currentPage, fetchNotifications]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get("/api/v0/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get("/api/v0/notifications/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  }, [user]);

  // Mark notifications as read
  const markAsRead = useCallback(
    async (notificationIds: string[], context = {}) => {
      try {
        const response = await axios.post("/api/v0/notifications/bulk", {
          notificationIds,
          action: "read",
          context: {
            device: "WEB",
            actionType: "VIEWED",
            ...context,
          },
        });

        if (response.data.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notification) =>
              notificationIds.includes(notification._id)
                ? {
                  ...notification,
                  lifecycle: {
                    ...notification.lifecycle,
                    status: "READ" as const,
                    readAt: new Date(),
                  },
                }
                : notification
            )
          );

          // Update unread count
          const readUnreadNotifications = notifications.filter(
            (n) =>
              notificationIds.includes(n._id) && n.lifecycle.status !== "READ"
          );
          setUnreadCount((prev) =>
            Math.max(0, prev - readUnreadNotifications.length)
          );
        }
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        setError("Failed to mark notifications as read");
      }
    },
    [notifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(
    async (customFilters = {}) => {
      try {
        const response = await axios.post(
          "/api/v0/notifications/mark-all-read",
          {
            filters: { ...filters, ...customFilters },
          }
        );

        if (response.data.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notification) => ({
              ...notification,
              lifecycle: {
                ...notification.lifecycle,
                status: "READ" as const,
                readAt: new Date(),
              },
            }))
          );

          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        setError("Failed to mark all notifications as read");
      }
    },
    [filters]
  );

  // Archive notifications
  const archiveNotifications = useCallback(
    async (notificationIds: string[]) => {
      try {
        const response = await axios.post("/api/v0/notifications/bulk", {
          notificationIds,
          action: "archive",
        });

        if (response.data.success) {
          // Remove from local state
          setNotifications((prev) =>
            prev.filter(
              (notification) => !notificationIds.includes(notification._id)
            )
          );

          // Update unread count
          const archivedUnreadNotifications = notifications.filter(
            (n) =>
              notificationIds.includes(n._id) && n.lifecycle.status !== "READ"
          );
          setUnreadCount((prev) =>
            Math.max(0, prev - archivedUnreadNotifications.length)
          );
        }
      } catch (error) {
        console.error("Error archiving notifications:", error);
        setError("Failed to archive notifications");
      }
    },
    [notifications]
  );

  // Delete notifications
  const deleteNotifications = useCallback(
    async (notificationIds: string[]) => {
      try {
        const response = await axios.post("/api/v0/notifications/bulk", {
          notificationIds,
          action: "delete",
        });

        if (response.data.success) {
          // Remove from local state
          setNotifications((prev) =>
            prev.filter(
              (notification) => !notificationIds.includes(notification._id)
            )
          );

          // Update unread count
          const deletedUnreadNotifications = notifications.filter(
            (n) =>
              notificationIds.includes(n._id) && n.lifecycle.status !== "READ"
          );
          setUnreadCount((prev) =>
            Math.max(0, prev - deletedUnreadNotifications.length)
          );
        }
      } catch (error) {
        console.error("Error deleting notifications:", error);
        setError("Failed to delete notifications");
      }
    },
    [notifications]
  );

  // Real-time subscription placeholders
  const subscribeToNotifications = useCallback(() => {
    // WebSocket implementation will go here
    console.log("Subscribing to real-time notifications");
  }, []);

  const unsubscribeFromNotifications = useCallback(() => {
    // WebSocket cleanup will go here
    console.log("Unsubscribing from real-time notifications");
  }, []);

  // Force refresh function for external triggers
  const forceRefresh = useCallback(async () => {
    if (user) {
      await refreshUnreadCount();
      await fetchNotifications(1);
      await refreshStats();
    }
  }, [user, refreshUnreadCount, fetchNotifications, refreshStats]);

  // Initialize notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications(1);
      refreshUnreadCount();
      refreshStats();
      subscribeToNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setStats(null);
      unsubscribeFromNotifications();
    }

    return () => {
      unsubscribeFromNotifications();
    };
  }, [
    user,
    fetchNotifications,
    refreshUnreadCount,
    refreshStats,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  ]);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [user, refreshUnreadCount]);

  // Fetch notifications when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      // New unread notifications! Refresh the list.
      fetchNotifications(1);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, fetchNotifications]);

  // Refresh on window focus to catch notifications created in other tabs
  useEffect(() => {
    if (!user) return;

    const handleFocus = () => {
      refreshUnreadCount();
      fetchNotifications(1);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refreshUnreadCount, fetchNotifications]);

  // Refetch when filters change
  useEffect(() => {
    if (user) {
      fetchNotifications(1);
    }
  }, [filters, fetchNotifications, user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    hasMore,
    filters,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotifications,
    deleteNotifications,
    refreshUnreadCount,
    refreshStats,
    setFilters,
    clearError,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    forceRefresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
