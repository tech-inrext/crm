export enum BudgetRange {
  LESS_THAN_1_LAKH = "<1 Lakh",
  ONE_TO_TEN_LAKH = "1 Lakh to 10 Lakh",
  TEN_TO_TWENTY_LAKH = "10 Lakh to 20 Lakh",
  TWENTY_TO_THIRTY_LAKH = "20 Lakh to 30 Lakh",
  THIRTY_TO_FIFTY_LAKH = "30 Lakh to 50 Lakh",
  FIFTY_LAKH_TO_1_CRORE = "50 Lakh to 1 Crore",
  MORE_THAN_1_CRORE = ">1 Crore",
}

export interface Lead {
  _id?: string;
  id?: string;
  leadId?: string; // For API compatibility
  fullName?: string;
  name?: string; // Legacy field
  email?: string;
  phone: string;
  propertyName?: string;
  propertyType?: string;
  location?: string;
  budgetRange?: string;
  contact?: string; // Contact person name
  company?: string;
  status: string;
  source?: string;
  managerId?: string; // ObjectId reference to Employee (lead manager)
  assignedTo?: string; // ObjectId reference to Employee (assigned team member)
  value?: number;
  notes?: string;
  followUpNotes?: string[];
  nextFollowUp?: string | Date;
  uploadedBy?: string; // ObjectId reference to Employee (who uploaded the lead)
  updatedBy?: string; // ObjectId reference to Employee (who last updated the lead)
  createdAt?: string;
  updatedAt?: string;
}

// Alias for consistency
export interface APILead extends Lead {}
export interface LeadDisplay extends Lead {}
