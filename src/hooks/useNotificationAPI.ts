import { useCallback } from "react";
import axios from "axios";
import {
  Notification as NotificationData,
  NotificationFilters,
} from "../types/notification.types";

interface UseNotificationAPIProps {
  user: any;
  pendingRoleSelection: boolean;
  filters: NotificationFilters;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setStats: (stats: any) => void;
  notifications: NotificationData[];
}

export const useNotificationAPI = ({
  user,
  pendingRoleSelection,
  filters,
  setLoading,
  setError,
  setNotifications,
  setCurrentPage,
  setTotalPages,
  setHasMore,
  setUnreadCount,
  setStats,
  notifications,
}: UseNotificationAPIProps) => {
  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Fetch notifications with pagination and filters
  const fetchNotifications = useCallback(
    async (page = 1, customFilters = {}) => {
      if (!user || pendingRoleSelection) return;

      try {
        setLoading(true);
        setError(null);

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
    [
      user,
      pendingRoleSelection,
      filters,
      setLoading,
      setError,
      setNotifications,
      setCurrentPage,
      setTotalPages,
      setHasMore,
    ]
  );

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!user || pendingRoleSelection) return;

    try {
      const response = await axios.get("/api/v0/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user, pendingRoleSelection, setUnreadCount]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    if (!user || pendingRoleSelection) return;

    try {
      const response = await axios.get("/api/v0/notifications/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  }, [user, pendingRoleSelection, setStats]);

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
    [notifications, setNotifications, setUnreadCount, setError]
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
    [filters, setNotifications, setUnreadCount, setError]
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
          setNotifications((prev) =>
            prev.filter(
              (notification) => !notificationIds.includes(notification._id)
            )
          );

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
    [notifications, setNotifications, setUnreadCount, setError]
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
          setNotifications((prev) =>
            prev.filter(
              (notification) => !notificationIds.includes(notification._id)
            )
          );

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
    [notifications, setNotifications, setUnreadCount, setError]
  );

  return {
    fetchNotifications,
    refreshUnreadCount,
    refreshStats,
    markAsRead,
    markAllAsRead,
    archiveNotifications,
    deleteNotifications,
  };
};
