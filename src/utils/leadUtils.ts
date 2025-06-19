import type { Lead } from '../types/lead';

// Lead form interface matching the component expectations
export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
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
  if (!value) return '$0';
  return `$${value.toLocaleString()}`;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'new':
      return '#2196f3';
    case 'contacted':
      return '#ff9800';
    case 'qualified':
      return '#4caf50';
    case 'lost':
      return '#f44336';
    case 'converted':
      return '#9c27b0';
    default:
      return '#757575';
  }
};

export const getSourceIcon = (source: string): string => {
  switch (source.toLowerCase()) {
    case 'website':
      return '🌐';
    case 'phone':
      return '📞';
    case 'email':
      return '📧';
    case 'referral':
      return '👥';
    case 'social':
      return '📱';
    default:
      return '📋';
  }
};

export const sortLeads = (leads: Lead[], sortBy: string, sortOrder: 'asc' | 'desc'): Lead[] => {
  return [...leads].sort((a, b) => {
    let valueA: any = a[sortBy as keyof Lead];
    let valueB: any = b[sortBy as keyof Lead];

    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterLeads = (leads: Lead[], searchTerm: string): Lead[] => {
  if (!searchTerm) return leads;
  
  const term = searchTerm.toLowerCase();
  return leads.filter(lead => 
    lead.name.toLowerCase().includes(term) ||
    lead.email.toLowerCase().includes(term) ||
    lead.phone.includes(term) ||
    (lead.contact && lead.contact.toLowerCase().includes(term)) ||
    (lead.company && lead.company.toLowerCase().includes(term)) ||
    lead.status.toLowerCase().includes(term)
  );
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
    fullName: apiLead.name || '',
    email: apiLead.email || '',
    phone: apiLead.phone || '',
    propertyType: apiLead.company || '', // Map company to propertyType
    location: apiLead.contact || '', // Map contact to location
    budgetRange: apiLead.value ? `$${apiLead.value}` : '',
    status: apiLead.status || 'new',
    source: apiLead.source || '',
    assignedTo: apiLead.assignedTo || '',
    nextFollowUp: '',
    followUpNotes: [],
  };
};

// Transform form data to API format
export const transformFormToAPI = (formData: LeadFormData): Partial<Lead> => {
  return {
    name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    company: formData.propertyType,
    contact: formData.location,
    value: parseFloat(formData.budgetRange.replace(/[$,]/g, '')) || 0,
    status: formData.status,
    source: formData.source,
    assignedTo: formData.assignedTo,
    notes: formData.followUpNotes.map(note => `${note.date}: ${note.note}`).join('\n'),
  };
};

// Calculate lead statistics
export const calculateLeadStats = (leads: Lead[]) => {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualified = leads.filter(l => l.status === 'qualified').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const closed = leads.filter(l => l.status === 'converted' || l.status === 'lost').length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return {
    total,
    new: newLeads,
    newLeads,
    qualified,
    converted,
    closed,
    totalValue,
    conversion: total > 0 ? Math.round((converted / total) * 100) : 0,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
  };
};

// Get default form data
export const getDefaultLeadFormData = (): LeadFormData => {
  return {
    fullName: '',
    email: '',
    phone: '',
    propertyType: '',
    location: '',
    budgetRange: '',
    status: 'New',
    source: '',
    assignedTo: '',
    nextFollowUp: '',
    followUpNotes: [],
  };
};
