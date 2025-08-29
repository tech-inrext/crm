export const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];
export const DEFAULT_PROJECTS = [
  { _id: "1", name: "Urbainia Trinity NX" },
  { _id: "2", name: "Migsun Rohini Central" },
  { _id: "3", name: "KW Blue Pearl" },
  { _id: "4", name: "KW Delhi-6" },
  { _id: "5", name: "Eco Village Cottage & Resort" },
  { _id: "6", name: "Sui Generis Residenncy" },
  { _id: "7", name: "Sky Harbor" },
  { _id: "8", name: "The Adriatico" },
  { _id: "9", name: "Sun Rise" },
  { _id: "10", name: "Sai Kunj" },
];

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "#2196F3";
    case "active":
      return "#FB8C00"; // amber / active
    case "approved":
      return "#4CAF50";
    case "completed":
      return "#9C27B0";
    case "cancelled":
      return "#F44336";
    default:
      return "#757575";
  }
};

export const getCurrentDateTime = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().slice(0, 16);
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const getProjectName = (project: string | { name: string }): string => {
  if (typeof project === "object" && project.name) return project.name;
  if (typeof project === "string") {
    const found = DEFAULT_PROJECTS.find(p => p._id === project);
    return found ? found.name : project;
  }
  return "Unknown Project";
};
