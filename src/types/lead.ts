export interface Lead {
  _id?: string;
  id?: string;
  leadId?: string; // For API compatibility
  name: string;
  email: string;
  phone: string;
  contact?: string; // Contact person name
  company?: string;
  status: string;
  source?: string;
  assignedTo?: string;
  value?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Alias for consistency
export interface APILead extends Lead {}
export interface LeadDisplay extends Lead {}
