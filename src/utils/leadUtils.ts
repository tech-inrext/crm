import type { Lead } from "@/types/lead";

// Lead form interface matching the component expectations
export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  propertyName: string;
  propertyType: string;
  location: string;
  budgetRange: string;
  status: string;
  source: string;
  assignedTo?: string;
  nextFollowUp?: string;
  followUpNotes: Array<{ note: string; date: string }>;
}

export const formatLeadValue = (value?: number): string => {
  if (!value) return "$0";
  return `$${value.toLocaleString()}`;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "new":
      return "#2196f3";
    case "contacted":
      return "#ff9800";
    case "qualified":
      return "#4caf50";
    case "lost":
      return "#f44336";
    case "converted":
      return "#9c27b0";
    default:
      return "#757575";
  }
};

export const getSourceIcon = (source: string): string => {
  switch (source.toLowerCase()) {
    case "website":
      return "🌐";
    case "phone":
      return "📞";
    case "email":
      return "📧";
    case "referral":
      return "👥";
    case "social":
      return "📱";
    default:
      return "📋";
  }
};

export const sortLeads = (
  leads: Lead[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Lead[] => {
  return [...leads].sort((a, b) => {
    let valueA: any = a[sortBy as keyof Lead];
    let valueB: any = b[sortBy as keyof Lead];

    if (typeof valueA === "string") valueA = valueA.toLowerCase();
    if (typeof valueB === "string") valueB = valueB.toLowerCase();

    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterLeads = (leads: Lead[], searchQuery: string): Lead[] => {
  const q = searchQuery.toLowerCase();
  return leads.filter(
    (l) =>
      l?.fullName?.toLowerCase().includes(q) ||
      l?.contact?.toLowerCase().includes(q) ||
      l?.email?.toLowerCase().includes(q) ||
      l?.phone?.toLowerCase().includes(q) ||
      l?.status?.toLowerCase().includes(q)
  );
};

export const filterEmployees = (employees: any[], search: string) => {
  const q = search.toLowerCase();
  return employees.filter((e) => {
    const roleName = typeof e.role === "string" ? e.role : e.role?.name || "";
    return (
      e.name.toLowerCase().includes(q) || roleName.toLowerCase().includes(q)
    );
  });
};

// Transform API lead to frontend format
export const transformAPILead = (apiLead: Lead): Lead => {
  return {
    ...apiLead,
    id: apiLead.leadId || apiLead._id || apiLead.id,
    _id: apiLead._id,
    leadId: apiLead.leadId || apiLead._id || apiLead.id,
  };
};

// Transform API lead to form data
export const transformAPILeadToForm = (apiLead: Lead): LeadFormData => {
  return {
    fullName: apiLead.fullName || "",
    email: apiLead.email || "",
    phone: apiLead.phone || "",
    propertyName: apiLead.propertyName || "",
    propertyType: apiLead.propertyType || "",
    location: apiLead.location || "",
    budgetRange: apiLead.budgetRange || "",
    status: apiLead.status || "new",
    source: apiLead.source || "",
    assignedTo: apiLead.assignedTo ? String(apiLead.assignedTo) : "",
    nextFollowUp: apiLead.nextFollowUp
      ? new Date(apiLead.nextFollowUp).toISOString()
      : "",
    followUpNotes: Array.isArray(apiLead.followUpNotes)
      ? apiLead.followUpNotes.map((note) => ({ note }))
      : [],
  };
};

// Helper to map budgetRange string to backend value (number)
const budgetRangeToValue = (budgetRange: string): number | undefined => {
  switch (budgetRange) {
    case "<1 Lakh":
      return 50000;
    case "1 Lakh to 10 Lakh":
      return 100000;
    case "10 Lakh to 20 Lakh":
      return 1000000;
    case "20 Lakh to 30 Lakh":
      return 2000000;
    case "30 Lakh to 50 Lakh":
      return 3000000;
    case "50 Lakh to 1 Crore":
      return 5000000;
    case ">1 Crore":
      return 10000000;
    default:
      return undefined;
  }
};

// Transform form data to API format
export const transformFormToAPI = (
  formData: LeadFormData,
  isEdit = false
): Partial<Lead> => {
  const payload: Partial<Lead> = {};

  // Only include fields that are present and valid
  if (formData.fullName && formData.fullName.trim() !== "")
    payload.fullName = formData.fullName.trim();
  if (formData.email && formData.email.trim() !== "")
    payload.email = formData.email.trim();
  // Only include phone if not editing (backend does not allow phone update)
  if (!isEdit && formData.phone && formData.phone.trim() !== "")
    payload.phone = formData.phone.trim();
  if (formData.propertyName && formData.propertyName.trim() !== "")
    payload.propertyName = formData.propertyName.trim();
  if (formData.propertyType && formData.propertyType.trim() !== "")
    payload.propertyType = formData.propertyType.trim();
  if (formData.location && formData.location.trim() !== "")
    payload.location = formData.location.trim();
  if (formData.budgetRange && formData.budgetRange.trim() !== "")
    payload.budgetRange = formData.budgetRange.trim();
  if (formData.status && formData.status.trim() !== "")
    payload.status = formData.status.trim();
  if (formData.source && formData.source.trim() !== "")
    payload.source = formData.source.trim();
  if (formData.assignedTo && formData.assignedTo !== "")
    payload.assignedTo = formData.assignedTo;
  if (formData.nextFollowUp && formData.nextFollowUp !== "")
    payload.nextFollowUp = new Date(formData.nextFollowUp);
  // followUpNotes: backend expects array of strings, so map to string array
  if (
    Array.isArray(formData.followUpNotes) &&
    formData.followUpNotes.length > 0
  ) {
    payload.followUpNotes = formData.followUpNotes.map(
      (noteObj) => noteObj.note
    );
  }
  return payload;
};

// Calculate lead statistics
export const calculateLeadStats = (leads: Lead[]) => {
  const total = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const closed = leads.filter(
    (l) => l.status === "Closed" || l.status === "Dropped"
  ).length;
  // Conversion: closed/total (if you want only closed deals)
  const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;

  return {
    total,
    new: newLeads,
    newLeads,
    closed,
    conversion,
    conversionRate: conversion,
  };
};

// Get default form data
export const getDefaultLeadFormData = (): LeadFormData => {
  return {
    fullName: "",
    email: "",
    phone: "",
    propertyName: "",
    propertyType: "",
    location: "",
    budgetRange: "",
    status: "new",
    source: "",
    assignedTo: "",
    nextFollowUp: "",
    followUpNotes: [],
  };
};

export const transformAPIRole = (apiRole: any): any => {
  const permissions: string[] = [];
  const moduleMap: Record<string, string> = {
    employee: "User", // Changed from "Users" to "User" to match frontend
    role: "Role", // Changed from "Roles" to "Role" to match frontend
    lead: "Lead", // Changed from "Leads" to "Lead" to match frontend
    department: "Department",
  };
  apiRole.read?.forEach((module: string) => {
    const frontendModule = moduleMap[module] || module;
    permissions.push(`${frontendModule}:read`);
  });
  apiRole.write?.forEach((module: string) => {
    const frontendModule = moduleMap[module] || module;
    permissions.push(`${frontendModule}:write`);
  });
  apiRole.delete?.forEach((module: string) => {
    const frontendModule = moduleMap[module] || module;
    permissions.push(`${frontendModule}:delete`);
  });
  return {
    _id: apiRole._id,
    name: apiRole.name,
    permissions,
    // Also keep the original arrays for easier access
    read: apiRole.read,
    write: apiRole.write,
    delete: apiRole.delete,
    // preserve system admin flag if present
    isSystemAdmin: Boolean(apiRole.isSystemAdmin),
  };
};

export const transformToAPIRole = (role: any) => {
  // If the role already has read/write/delete arrays, return it as-is
  if (role.read || role.write || role.delete) {
    return {
      _id: role._id,
      name: role.name,
      read: role.read || [],
      write: role.write || [],
      delete: role.delete || [],
      // preserve isSystemAdmin flag when present
      isSystemAdmin: Boolean((role as any).isSystemAdmin),
    };
  }

  // Otherwise, transform from permissions array format
  const read: string[] = [];
  const write: string[] = [];
  const deletePerms: string[] = [];
  const moduleMap: Record<string, string> = {
    User: "employee", // Frontend "User" -> backend "employee"
    Role: "role", // Frontend "Role" -> backend "role"
    Lead: "lead", // Frontend "Lead" -> backend "lead"
    Department: "department",
  };

  if (role.permissions && Array.isArray(role.permissions)) {
    role.permissions.forEach((perm: string) => {
      const [module, permission] = perm.split(":");
      const apiModule = moduleMap[module] || module.toLowerCase();
      switch (permission) {
        case "read":
          if (!read.includes(apiModule)) read.push(apiModule);
          break;
        case "write":
          if (!write.includes(apiModule)) write.push(apiModule);
          break;
        case "delete":
          if (!deletePerms.includes(apiModule)) deletePerms.push(apiModule);
          break;
      }
    });
  }

  return {
    _id: role._id,
    name: role.name,
    read,
    write,
    delete: deletePerms,
    // if original role object had isSystemAdmin, carry it through
    isSystemAdmin: Boolean((role as any).isSystemAdmin),
  };
};
