import { format, formatDistanceToNow } from "date-fns";

export const formatNotificationTime = (
  dateString: string,
  isClient: boolean
): string => {
  if (!isClient) return "moments ago";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM dd, yyyy 'at' hh:mm a");
  } catch {
    return "Unknown time";
  }
};

export const getPriorityColor = (
  priority: string
): "error" | "warning" | "info" | "default" => {
  const colors = {
    URGENT: "error",
    HIGH: "warning",
    MEDIUM: "info",
    LOW: "default",
  } as const;
  return colors[priority as keyof typeof colors] || "default";
};

export const sortNotifications = (
  notifications: any[],
  sortBy: "date" | "priority" | "type",
  sortOrder: "asc" | "desc"
) => {
  return [...notifications].sort((a, b) => {
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
};

export const filterNotifications = (
  notifications: any[],
  filters: {
    searchQuery: string;
    filterStatus: string;
    filterType: string;
    filterPriority: string;
    showOnlyUnread: boolean;
  }
) => {
  return notifications.filter((notification) => {
    if (
      filters.searchQuery &&
      !notification.title
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) &&
      !notification.message
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.filterStatus !== "all" &&
      notification.lifecycle.status.toLowerCase() !== filters.filterStatus
    ) {
      return false;
    }

    if (
      filters.filterType !== "all" &&
      notification.type !== filters.filterType
    ) {
      return false;
    }

    if (
      filters.filterPriority !== "all" &&
      notification.metadata.priority !== filters.filterPriority
    ) {
      return false;
    }

    if (filters.showOnlyUnread && notification.lifecycle.status === "READ") {
      return false;
    }

    return true;
  });
};
