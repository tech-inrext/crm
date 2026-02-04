import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  MenuItem,
  Menu,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@/components/ui/Component";
import {
  Add,
  PersonAdd,
  History,
  FilterAltIcon,
  DownloadIcon,
  UploadFile,
  AssignmentInd,
} from "@/components/ui/Component";
import { MoreVert, CalendarToday } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import dynamic from "next/dynamic";
import { LEAD_STATUSES } from "@/constants/leads";

const BulkUpload = dynamic(() => import("@/components/leads/bulkUpload"), {
  ssr: false,
});
const BulkAssign = dynamic(() => import("@/components/leads/BulkAssign"), {
  ssr: false,
});
const CheckUploadStatusDialog = dynamic(
  () => import("@/components/leads/CheckUploadStatusDialog"),
  {
    ssr: false,
  },
);

interface LeadsActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
  onAdd: () => void;
  saving: boolean;
  loadLeads: () => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  // New props for date filter
  dateFilter?: {
    startDate?: Date | null;
    endDate?: Date | null;
  };
  onDateFilterChange?: (dateRange: {
    startDate?: Date | null;
    endDate?: Date | null;
  }) => void;
}

const LeadsActionBar: React.FC<LeadsActionBarProps> = ({
  search,
  onSearchChange,
  viewMode,
  setViewMode,
  onAdd,
  saving,
  loadLeads,
  selectedStatuses = [],
  onStatusesChange,
  dateFilter,
  onDateFilterChange,
}) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [uploadStatusOpen, setUploadStatusOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [tempDateRange, setTempDateRange] = useState<{
    startDate?: Date | null;
    endDate?: Date | null;
  }>({
    startDate: dateFilter?.startDate || null,
    endDate: dateFilter?.endDate || null,
  });

  // Add ref for filter button
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const openMobileMenu = (e: React.MouseEvent<HTMLElement>) => {
    // If clicked from the filter button directly
    if (e.currentTarget === filterButtonRef.current) {
      setMobileAnchor(e.currentTarget);
    } else {
      // If clicked from filter menu item, use the filter button as anchor
      if (filterButtonRef.current) {
        setMobileAnchor(filterButtonRef.current);
      }
    }
  };

  const closeMobileMenu = () => setMobileAnchor(null);

  const openFilterMenu = (e: React.MouseEvent<HTMLElement>) =>
    setFilterMenuAnchor(e.currentTarget);

  const closeFilterMenu = () => setFilterMenuAnchor(null);

  const mobileMenuOpen = Boolean(mobileAnchor);
  const actionsMenuOpen = Boolean(actionsAnchor);
  const filterMenuOpen = Boolean(filterMenuAnchor);

  const openActionsMenu = (e: React.MouseEvent<HTMLElement>) =>
    setActionsAnchor(e.currentTarget);

  const closeActionsMenu = () => setActionsAnchor(null);

  // Check if any filters are active
  const isFilterActive =
    selectedStatuses.length > 0 ||
    (dateFilter && (dateFilter.startDate || dateFilter.endDate));

  // Format date for display
  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle date filter apply
  const handleDateFilterApply = () => {
    if (onDateFilterChange) {
      onDateFilterChange(tempDateRange);
    }
    setDateFilterOpen(false);
  };

  // Handle clear date filter
  const handleClearDateFilter = () => {
    setTempDateRange({ startDate: null, endDate: null });
    if (onDateFilterChange) {
      onDateFilterChange({ startDate: null, endDate: null });
    }
    setDateFilterOpen(false);
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    onStatusesChange([]);
    if (onDateFilterChange) {
      onDateFilterChange({ startDate: null, endDate: null });
    }
    closeFilterMenu();
    closeMobileMenu();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "row" },
        gap: { xs: 1.5, sm: 2, md: 3 },
        alignItems: { xs: "stretch", md: "center" },
        width: "100%",
        overflow: "visible",
      }}
    >
      {/* Controls Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        {/* Search Bar */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "300px",
            flexGrow: 1,
            order: { xs: 1, sm: 1 },
            minWidth: 0,
          }}
        >
          <SearchBar
            sx={{
              width: "100%",
              minWidth: 0,
              maxWidth: "300px",
              "& .MuiInputBase-input:focus::placeholder": {
                opacity: 0.4,
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
              "& .MuiInputLabel-shrink": {
                fontSize: "0.875rem",
              },
            }}
            value={search}
            onChange={onSearchChange}
            placeholder="Search leads by name, email, phone..."
          />
        </Box>

        {/* Filter Button with Menu */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: 1,
          }}
        >
          <Tooltip title="Filter leads">
            <IconButton
              ref={filterButtonRef}
              size="small"
              onClick={(e) => {
                // Open the main filter menu on button click
                openFilterMenu(e);
              }}
              sx={{
                backgroundColor: isFilterActive ? "primary.main" : "#fff",
                color: isFilterActive ? "white" : "inherit",
                boxShadow: 1,
                "&:hover": {
                  backgroundColor: isFilterActive ? "primary.dark" : "#f5f5f5",
                },
                position: "relative",
              }}
              aria-controls={filterMenuOpen ? "filter-options-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={filterMenuOpen ? "true" : undefined}
            >
              <FilterAltIcon fontSize="small" />
              {isFilterActive && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "error.main",
                    border: "1px solid white",
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {/* Filter Options Menu */}
          <Menu
            id="filter-options-menu"
            anchorEl={filterMenuAnchor}
            open={filterMenuOpen}
            onClose={closeFilterMenu}
            MenuListProps={{
              sx: {
                minWidth: 200,
                py: 0.5,
              },
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                overflow: "hidden",
                mt: 1,
              },
            }}
          >
            {/* Date Filter Option */}
            <MenuItem
              onClick={() => {
                setTempDateRange({
                  startDate: dateFilter?.startDate || null,
                  endDate: dateFilter?.endDate || null,
                });
                setDateFilterOpen(true);
                closeFilterMenu();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 0.75,
                px: 1.5,
                borderRadius: 1,
                mx: 0.75,
                my: 0.25,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CalendarToday fontSize="small" />
              <Box sx={{ flexGrow: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    display: "block",
                  }}
                >
                  Date Filter
                </Box>
                {(dateFilter?.startDate || dateFilter?.endDate) && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      display: "block",
                      mt: 0.25,
                    }}
                  >
                    {dateFilter.startDate &&
                      formatDateForDisplay(dateFilter.startDate)}
                    {dateFilter.startDate && dateFilter.endDate && " - "}
                    {dateFilter.endDate &&
                      formatDateForDisplay(dateFilter.endDate)}
                  </Box>
                )}
              </Box>
              {(dateFilter?.startDate || dateFilter?.endDate) && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                  }}
                />
              )}
            </MenuItem>

            {/* Status Filter Option */}
            <MenuItem
              onClick={(e) => {
                closeFilterMenu();
                // Open status filter menu with filter button as anchor
                openMobileMenu(e);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 0.75,
                px: 1.5,
                borderRadius: 1,
                mx: 0.75,
                my: 0.25,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <FilterAltIcon fontSize="small" />
              <Box sx={{ flexGrow: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    display: "block",
                  }}
                >
                  Status Filter
                </Box>
                {selectedStatuses.length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      display: "block",
                      mt: 0.25,
                    }}
                  >
                    {selectedStatuses.length} selected
                  </Box>
                )}
              </Box>
              {selectedStatuses.length > 0 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                  }}
                />
              )}
            </MenuItem>

            {/* Clear All Filters Option */}
            {isFilterActive && (
              <MenuItem
                onClick={handleClearAllFilters}
                sx={{
                  color: "error.main",
                  justifyContent: "center",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  mt: 0.5,
                  py: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                  },
                }}
              >
                Clear All Filters
              </MenuItem>
            )}
          </Menu>

          {/* Status Filter Menu */}
          <Menu
            id="mobile-status-menu"
            anchorEl={mobileAnchor}
            open={mobileMenuOpen}
            onClose={closeMobileMenu}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            MenuListProps={{
              sx: {
                minWidth: 220,
                py: 0.5,
              },
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                overflow: "hidden",
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                onStatusesChange([]);
                closeMobileMenu();
              }}
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                py: 1,
                px: 1.5,
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              All Statuses
            </MenuItem>
            {LEAD_STATUSES.filter(Boolean).map((s) => (
              <MenuItem
                key={s}
                onClick={() => {
                  const newStatuses = selectedStatuses.includes(s)
                    ? selectedStatuses.filter((st) => st !== s)
                    : [...selectedStatuses, s];
                  onStatusesChange(newStatuses);
                  // Keep menu open for multiple selections
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 0.75,
                  px: 1.5,
                  borderRadius: 1,
                  mx: 0.75,
                  my: 0.25,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(s)}
                  readOnly
                  style={{
                    cursor: "pointer",
                    width: 16,
                    height: 16,
                    accentColor: "#1e5fbf",
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    flexGrow: 1,
                  }}
                >
                  {s}
                </Box>
              </MenuItem>
            ))}
            {selectedStatuses.length > 0 && (
              <MenuItem
                onClick={() => {
                  onStatusesChange([]);
                  closeMobileMenu();
                }}
                sx={{
                  color: "error.main",
                  justifyContent: "center",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  mt: 0.5,
                  py: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                  },
                }}
              >
                Clear Status
              </MenuItem>
            )}
          </Menu>
        </Box>

        {/* Action Menu */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: { xs: "center", sm: "flex-end" },
              order: { xs: 3, sm: 3 },
            }}
          >
            {!isTablet && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={onAdd}
                disabled={saving}
                sx={{
                  minWidth: { xs: "auto", sm: 140 },
                  height: { xs: 42, sm: 38 },
                  borderRadius: 1.5,
                  fontWeight: 500,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  textTransform: "none",
                  backgroundColor: "#e8f1ff",
                  color: "#1e5fbf",
                  boxShadow: "none",
                  border: "1px solid rgba(30, 95, 191, 0.18)",
                  "& .MuiButton-startIcon": {
                    marginRight: "6px",
                  },
                  "&:hover": {
                    backgroundColor: "#deebff",
                    borderColor: "rgba(30, 95, 191, 0.28)",
                    boxShadow: "none",
                  },
                }}
              >
                {saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Add Lead"
                )}
              </Button>
            )}
            <Tooltip title="Lead actions">
              <IconButton
                size="small"
                onClick={openActionsMenu}
                sx={{ background: "#fff", boxShadow: 1 }}
                aria-controls={
                  actionsMenuOpen ? "lead-actions-menu" : undefined
                }
                aria-haspopup="true"
                aria-expanded={actionsMenuOpen ? "true" : undefined}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              id="lead-actions-menu"
              anchorEl={actionsAnchor}
              open={actionsMenuOpen}
              onClose={closeActionsMenu}
              MenuListProps={{ sx: { p: 0.5 } }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  mt: 1,
                },
              }}
            >
              <Stack
                direction="column"
                spacing={0.5}
                sx={{
                  minWidth: 220,
                }}
              >
                <MenuItem
                  onClick={async () => {
                    try {
                      const XLSX = await import("xlsx");
                      const data = [
                        ["fullName", "email", "phone"],
                        ["Sample Lead Name 1", "lead1@gmail.com", "7500000001"],
                        [
                          "Sample Lead Name 2",
                          "(leave blank if not available)",
                          "7500000002",
                        ],
                        ["Sample Lead Name 3", "lead3@gmail.com", "7500000003"],
                        [
                          "Sample Lead Name 4",
                          "(leave blank if not available)",
                          "7500000004",
                        ],
                        [
                          "(leave blank if not available)",
                          "lead5@gmail.com",
                          "7500000005",
                        ],
                      ];
                      const ws = XLSX.utils.aoa_to_sheet(data);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Template");
                      XLSX.writeFile(wb, "lead_upload_template.xlsx");
                    } catch (error) {
                      console.error("Error downloading template:", error);
                    } finally {
                      closeActionsMenu();
                    }
                  }}
                  sx={{
                    borderRadius: 1,
                    gap: 1.5,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <DownloadIcon fontSize="small" />
                  {isTablet ? "Template" : "Download Template"}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    closeActionsMenu();
                    const input = document.getElementById(
                      "bulk-upload-excel",
                    ) as HTMLInputElement | null;
                    input?.click();
                  }}
                  sx={{
                    borderRadius: 1,
                    gap: 1.5,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <UploadFile fontSize="small" />
                  Bulk Upload
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    closeActionsMenu();
                    setTimeout(() => {
                      const trigger = document.getElementById(
                        "bulk-assign-trigger",
                      );
                      trigger?.dispatchEvent(
                        new MouseEvent("click", { bubbles: true }),
                      );
                    }, 0);
                  }}
                  sx={{
                    borderRadius: 1,
                    gap: 1.5,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <AssignmentInd fontSize="small" />
                  Bulk Assign
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setUploadStatusOpen(true);
                    closeActionsMenu();
                  }}
                  sx={{
                    borderRadius: 1,
                    gap: 1.5,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <History fontSize="small" />
                  {isTablet ? "Upload Status" : "Check Upload Status"}
                </MenuItem>

                {isTablet && (
                  <MenuItem
                    onClick={() => {
                      onAdd();
                      closeActionsMenu();
                    }}
                    disabled={saving}
                    sx={{
                      borderRadius: 1,
                      gap: 1.5,
                      py: 1,
                      px: 1.5,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {saving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <>
                        <Add fontSize="small" />
                        Add Lead
                      </>
                    )}
                  </MenuItem>
                )}
              </Stack>
            </Menu>
            <Box
              sx={{
                position: "absolute",
                width: 0,
                height: 0,
                overflow: "hidden",
              }}
            >
              <BulkUpload loadLeads={loadLeads} hideButton />
              <BulkAssign
                onSuccess={loadLeads}
                hideButton
                buttonId="bulk-assign-trigger"
              />
            </Box>
          </Box>
        </PermissionGuard>
      </Box>

      {/* Date Filter Dialog */}
      <Dialog
        open={dateFilterOpen}
        onClose={() => setDateFilterOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          Filter by Date Range
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <DatePicker
                label="Start Date"
                value={tempDateRange.startDate}
                onChange={(newValue) =>
                  setTempDateRange((prev) => ({ ...prev, startDate: newValue }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={tempDateRange.endDate}
                onChange={(newValue) =>
                  setTempDateRange((prev) => ({ ...prev, endDate: newValue }))
                }
                minDate={tempDateRange.startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClearDateFilter}
            color="error"
            variant="outlined"
            size="small"
          >
            Clear
          </Button>
          <Button
            onClick={() => setDateFilterOpen(false)}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDateFilterApply}
            variant="contained"
            size="small"
            disabled={!tempDateRange.startDate && !tempDateRange.endDate}
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Status Dialog */}
      <CheckUploadStatusDialog
        open={uploadStatusOpen}
        onClose={() => setUploadStatusOpen(false)}
      />
    </Box>
  );
};

export default LeadsActionBar;