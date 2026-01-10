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
import {
  Notification as NotificationData,
  NotificationContextType,
  NotificationStats,
  NotificationFilters,
} from "../types/notification.types";
import { useNotificationAPI } from "../hooks/useNotificationAPI";

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
  const { user, pendingRoleSelection } = useAuth();

  // State
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [filters, setFiltersState] = useState<NotificationFilters>({
    status: undefined,
    type: undefined,
    priority: undefined,
  });

  // Track previous unread count to detect new notifications
  const prevUnreadCountRef = useRef(unreadCount);

  // Custom hooks

  const {
    fetchNotifications,
    refreshUnreadCount,
    refreshStats,
    markAsRead,
    markAllAsRead,
    archiveNotifications,
    deleteNotifications,
  } = useNotificationAPI({
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
  });

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setFilters = useCallback((newFilters: any) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    setNotifications([]);
  }, []);

  const loadMoreNotifications = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchNotifications(currentPage + 1);
    }
  }, [hasMore, loading, currentPage]);

  const forceRefresh = useCallback(async () => {
    if (user) {
      await refreshUnreadCount();
      await fetchNotifications(1);
      await refreshStats();
    }
  }, [user]);

  // Effects
  useEffect(() => {
    if (user && !pendingRoleSelection) {
      fetchNotifications(1);
      refreshUnreadCount();
      refreshStats();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setStats(null);
    }
  }, [user, pendingRoleSelection]);

  useEffect(() => {
    if (!user || pendingRoleSelection) return;

    const intervalId = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, pendingRoleSelection]);

  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      fetchNotifications(1);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!user || pendingRoleSelection) return;

    const handleFocus = () => {
      refreshUnreadCount();
      fetchNotifications(1);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, pendingRoleSelection]);

  useEffect(() => {
    if (user && !pendingRoleSelection) {
      fetchNotifications(1);
    }
  }, [filters, user, pendingRoleSelection]);

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
    forceRefresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
