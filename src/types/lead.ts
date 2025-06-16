// Shared types for Lead entity - used by both backend and frontend
// Based on the Mongoose schema in src/models/Lead.js

export interface Lead {
  _id: string;
  leadId: string;
  fullName: string;
  email?: string;
  phone: string;
  propertyType: "Rent" | "Buy" | "Sell";
  location?: string;
  budgetRange?: string;
  status: "New" | "Contacted" | "Site Visit" | "Closed" | "Dropped";
  source?: string;
  assignedTo?: string;
  followUpNotes: Array<{
    note: string;
    date: Date | string;
    _id?: string;
  }>;
  nextFollowUp?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Frontend display interface (transformed from API response)
export interface LeadDisplay {
  _id?: string;
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
  value: string;
}

// Form data interface for creating/editing leads
export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  budgetRange: string;
  status: string;
  source: string;
  assignedTo: string;
  nextFollowUp: string;
  followUpNotes: Array<{
    note: string;
    date: string;
  }>;
}

// API response wrapper
export interface LeadAPIResponse {
  success: boolean;
  data: Lead | Lead[];
  message?: string;
  error?: string;
}

// Validation types
export const PROPERTY_TYPES = ["Rent", "Buy", "Sell"] as const;
export const LEAD_STATUSES = ["New", "Contacted", "Site Visit", "Closed", "Dropped"] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];
export type LeadStatus = typeof LEAD_STATUSES[number];
