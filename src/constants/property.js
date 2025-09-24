export const PROPERTY_API_BASE = "/api/v0/property";
export const PROPERTY_ROWS_PER_PAGE_OPTIONS = [6, 12, 24, 48];
export const PROPERTY_STATUS_OPTIONS = ["Under Construction", "Ready to Move", "Pre Launch"];

export const PROPERTY_FORM_DEFAULT = {
  projectName: "",
  builderName: "",
  description: "",
  location: "",
  price: "",
  status: "Under Construction",
  features: [],
  amenities: [],
  nearby: [],
  projectHighlights: [],
  mapLocation: { lat: 0, lng: 0 },
  brochureUrls: [],
  creatives: [],
  videoIds: [],
};

export const PROPERTY_PERMISSION_MODULE = "property";