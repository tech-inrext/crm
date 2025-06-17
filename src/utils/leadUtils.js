// Lead business logic utilities
// Data transformation and business operations for Lead entities

/**
 * Transform Lead from database format to display format
 * @param {Object} apiLead - Lead from database/API
 * @returns {Object} - Lead in display format
 */
export const transformAPILead = (apiLead) => ({
  _id: apiLead._id,
  id: apiLead.leadId,
  name: apiLead.fullName,
  contact: apiLead.phone,
  email: apiLead.email || "",
  phone: apiLead.phone,
  status: apiLead.status,
  value: apiLead.budgetRange || "Not specified",
});

/**
 * Transform Lead from database format to form format
 * @param {Object} apiLead - Lead from database/API
 * @returns {Object} - Lead in form format
 */
export const transformAPILeadToForm = (apiLead) => ({
  fullName: apiLead.fullName,
  email: apiLead.email || "",
  phone: apiLead.phone,
  propertyType: apiLead.propertyType,
  location: apiLead.location || "",
  budgetRange: apiLead.budgetRange || "",
  status: apiLead.status,
  source: apiLead.source || "",
  assignedTo: apiLead.assignedTo || "",
  nextFollowUp: apiLead.nextFollowUp
    ? new Date(apiLead.nextFollowUp).toISOString().split("T")[0]
    : "",
  followUpNotes: (apiLead.followUpNotes || []).map((note) => ({
    note: note.note,
    date: new Date(note.date).toISOString().split("T")[0],
  })),
});

/**
 * Transform form data to API format
 * @param {Object} formData - Form data
 * @param {string} leadId - Lead ID (optional for updates)
 * @returns {Object} - Data in API format
 */
export const transformFormToAPI = (formData, leadId) => {
  const cleanPhone = formData.phone.replace(/\D/g, "");
  const apiData = {
    fullName: formData.fullName.trim(),
    email: formData.email?.trim() || undefined,
    phone: cleanPhone,
    propertyType: formData.propertyType,
    location: formData.location?.trim() || undefined,
    budgetRange: formData.budgetRange?.trim() || undefined,
    status: formData.status,
    source: formData.source?.trim() || undefined,
    assignedTo: formData.assignedTo?.trim() || undefined,
    nextFollowUp:
      formData.nextFollowUp && formData.nextFollowUp.trim()
        ? new Date(formData.nextFollowUp).toISOString()
        : undefined,
    followUpNotes: formData.followUpNotes
      .filter((note) => note.note.trim())
      .map((note) => ({
        note: note.note.trim(),
        date: new Date(note.date).toISOString(),
      })),
  };
  if (leadId) apiData.leadId = leadId;
  return apiData;
};

/**
 * Calculate lead statistics
 * @param {Array} leads - Array of leads
 * @returns {Object} - Statistics object
 */
export const calculateLeadStats = (leads) => ({
  total: leads.length,
  new: leads.filter((l) => l.status === "New").length,
  contacted: leads.filter((l) => l.status === "Contacted").length,
  closed: leads.filter((l) => l.status === "Closed").length,
  conversion:
    leads.length > 0
      ? (
          (leads.filter((l) => l.status === "Closed").length / leads.length) *
          100
        ).toFixed(1)
      : "0",
});

/**
 * Default form data for creating new leads
 */
export const getDefaultLeadFormData = () => ({
  fullName: "",
  email: "",
  phone: "",
  propertyType: "",
  location: "",
  budgetRange: "",
  status: "New",
  source: "",
  assignedTo: "",
  nextFollowUp: "",
  followUpNotes: [],
});

/**
 * Validate lead data
 * @param {Object} leadData - Lead data to validate
 * @returns {Object} - Validation result
 */
export const validateLeadData = (leadData) => {
  const errors = [];

  if (!leadData.fullName?.trim()) {
    errors.push("Full name is required");
  }

  if (!leadData.phone?.trim()) {
    errors.push("Phone number is required");
  } else if (!/^\d{10,15}$/.test(leadData.phone.replace(/\D/g, ""))) {
    errors.push("Invalid phone number format");
  }

  if (!leadData.propertyType) {
    errors.push("Property type is required");
  }

  if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
