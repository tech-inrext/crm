import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  Notification,
} from "../contexts/NotificationContext";

interface UseNotificationActionsOptions {
  onSuccess?: (action: string, count: number) => void;
  onError?: (action: string, error: string) => void;
}

export const useNotificationActions = (
  options: UseNotificationActionsOptions = {}
) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const {
    markAsRead,
    markAllAsRead,
    archiveNotifications,
    deleteNotifications,
    refreshUnreadCount,
  } = useNotifications();

  const { onSuccess, onError } = options;

  // Select/deselect notifications
  const toggleSelection = useCallback((notificationId: string) => {
    setSelectedIds((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  }, []);

  const selectAll = useCallback((notifications: Notification[]) => {
    setSelectedIds(notifications.map((n) => n._id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Actions with loading states
  const executeAction = useCallback(
    async (action: () => Promise<any>, actionName: string, count: number) => {
      try {
        setActionLoading(actionName);
        await action();
        clearSelection();
        await refreshUnreadCount();
        onSuccess?.(actionName, count);
      } catch (error) {
        console.error(`Error executing ${actionName}:`, error);
        onError?.(actionName, error.message || `Failed to ${actionName}`);
      } finally {
        setActionLoading(null);
      }
    },
    [clearSelection, refreshUnreadCount, onSuccess, onError]
  );

  const markSelectedAsRead = useCallback(
    async (context = {}) => {
      if (selectedIds.length === 0) return;

      await executeAction(
        () => markAsRead(selectedIds, context),
        "mark as read",
        selectedIds.length
      );
    },
    [selectedIds, markAsRead, executeAction]
  );

  const markAllAsReadAction = useCallback(
    async (filters = {}) => {
      await executeAction(() => markAllAsRead(filters), "mark all as read", 0);
    },
    [markAllAsRead, executeAction]
  );

  const archiveSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;

    await executeAction(
      () => archiveNotifications(selectedIds),
      "archive",
      selectedIds.length
    );
  }, [selectedIds, archiveNotifications, executeAction]);

  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;

    await executeAction(
      () => deleteNotifications(selectedIds),
      "delete",
      selectedIds.length
    );
  }, [selectedIds, deleteNotifications, executeAction]);

  return {
    selectedIds,
    actionLoading,
    toggleSelection,
    selectAll,
    clearSelection,
    markSelectedAsRead,
    markAllAsReadAction,
    archiveSelected,
    deleteSelected,
    hasSelectedItems: selectedIds.length > 0,
    selectedCount: selectedIds.length,
  };
};

// Hook for handling individual notification actions
export const useNotificationItem = (notification: Notification) => {
  const { markAsRead } = useNotifications();
  const [isRead, setIsRead] = useState(
    notification.lifecycle.status === "READ"
  );

  const markAsReadAction = useCallback(
    async (context = {}) => {
      if (!isRead) {
        await markAsRead([notification._id], {
          actionType: "CLICKED",
          ...context,
        });
        setIsRead(true);
      }
    },
    [notification._id, markAsRead, isRead]
  );

  const router = useRouter();
  // ... (inside hook)

  const handleNotificationClick = useCallback(async () => {
    await markAsReadAction({ actionType: "CLICKED" });

    // Navigate to action URL if present
    if (notification.metadata.actionUrl) {
      if (notification.metadata.actionUrl.startsWith("/")) {
        router.push(notification.metadata.actionUrl);
      } else {
        window.location.href = notification.metadata.actionUrl;
      }
    }
  }, [markAsReadAction, notification.metadata.actionUrl, router]);

  useEffect(() => {
    setIsRead(notification.lifecycle.status === "READ");
  }, [notification.lifecycle.status]);

  return {
    isRead,
    markAsReadAction,
    handleNotificationClick,
    priority: notification.metadata.priority,
    isActionable: notification.metadata.isActionable,
    hasActionUrl: Boolean(notification.metadata.actionUrl),
  };
};

// Hook for notification filters and search
export const useNotificationFilters = () => {
  const { filters, setFilters, fetchNotifications } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      setFilters({ [key]: value });
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      status: undefined,
      type: undefined,
      priority: undefined,
    });
    setSearchTerm("");
  }, [setFilters]);

  const applyFilters = useCallback(
    async (customFilters = {}) => {
      await fetchNotifications(1, customFilters);
    },
    [fetchNotifications]
  );

  return {
    filters,
    searchTerm,
    setSearchTerm,
    updateFilter,
    clearFilters,
    applyFilters,
  };
};

// Hook for notification statistics and insights
export const useNotificationInsights = () => {
  const { stats, refreshStats, notifications } = useNotifications();
  const [insights, setInsights] = useState({
    mostCommonType: null,
    averageResponseTime: null,
    todayCount: 0,
    thisWeekCount: 0,
    priorityDistribution: {},
  });

  useEffect(() => {
    if (notifications.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayCount = notifications.filter(
        (n) => new Date(n.createdAt) >= today
      ).length;

      const thisWeekCount = notifications.filter(
        (n) => new Date(n.createdAt) >= thisWeek
      ).length;

      const priorityDistribution = notifications.reduce((acc, notification) => {
        const priority = notification.metadata.priority;
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const typeCounts = notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonType = Object.entries(typeCounts).reduce(
        (max, [type, count]) => (count > max.count ? { type, count } : max),
        { type: null, count: 0 }
      );

      setInsights({
        mostCommonType: mostCommonType.type,
        averageResponseTime: null, // Calculate if needed
        todayCount,
        thisWeekCount,
        priorityDistribution,
      });
    }
  }, [notifications]);

  return {
    stats,
    insights,
    refreshStats,
  };
};

export default useNotificationActions;
