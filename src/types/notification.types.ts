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

export interface NotificationFilters {
  status?: string;
  type?: string;
  priority?: string;
}

export interface NotificationContextType {
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
  filters: NotificationFilters;

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

  // Force refresh
  forceRefresh: () => Promise<void>;
}
