import React, { useState, useMemo } from "react";
import {
  Add,
  PersonAdd,
  History,
  FilterAltIcon,
  DownloadIcon,
  UploadFile,
  AssignmentInd,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
  Checkbox,
  FormControlLabel,
  Divider,
  Badge,
  Typography,
  MenuItem,
  Menu,
  CircularProgress,
  ExpandMore,
  Clear,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  HomeIcon,
  MonetizationOn as MoneyIcon,
  People as PeopleIcon,
  alpha,
} from "@/components/ui/Component";
import { MoreVert } from "@mui/icons-material";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import dynamic from "next/dynamic";
import { LEAD_STATUSES, LEAD_TYPES, budgetRanges } from "@/constants/leads";
import { Popover, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

const BulkUploadDialogDynamic = dynamic(
  () => import("@/components/leads/BulkUploadDialog"),
  { ssr: false }
);

const BulkAssign = dynamic(() => import("@/components/leads/BulkAssign"), {
  ssr: false,
});
const CheckUploadStatusDialog = dynamic(
  () => import("@/components/leads/CheckUploadStatusDialog"),
  {
    ssr: false,
  }
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
  selectedLeadTypes: string[];
  onLeadTypesChange: (types: string[]) => void;
  selectedProperties: string[];
  onPropertiesChange: (properties: string[]) => void;
  selectedBudgets: string[];
  onBudgetsChange: (budgets: string[]) => void;
  selectedAssignedTo: string[];
  onAssignedToChange: (ids: string[]) => void;
  onClearAllFilters?: () => void;
  teamMembers: any[];
  leads: any[];
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
  selectedLeadTypes = [],
  onLeadTypesChange,
  selectedProperties = [],
  onPropertiesChange,
  selectedBudgets = [],
  onBudgetsChange,
  selectedAssignedTo = [],
  onAssignedToChange,
  onClearAllFilters,
  teamMembers = [],
  leads = [],
}) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [uploadStatusOpen, setUploadStatusOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const actionsMenuOpen = Boolean(actionsAnchor);
  const filterOpen = Boolean(filterAnchor);

  const openActionsMenu = (e: React.MouseEvent<HTMLElement>) => setActionsAnchor(e.currentTarget);
  const closeActionsMenu = () => setActionsAnchor(null);

  const openFilter = (e: React.MouseEvent<HTMLElement>) => setFilterAnchor(e.currentTarget);
  const closeFilter = () => setFilterAnchor(null);

  const activeFilterCount = 
    selectedStatuses.length + 
    selectedLeadTypes.length + 
    selectedProperties.length + 
    selectedBudgets.length +
    selectedAssignedTo.length;

  const uniqueProperties = useMemo(() => {
    const props = leads
      .map((l) => l.propertyName || l.property)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    return props.sort();
  }, [leads]);



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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: 1,
          }}
        >
          <Tooltip title="Filter leads">
            <IconButton
              size="small"
              onClick={openFilter}
              sx={{
                backgroundColor: activeFilterCount > 0 ? "primary.main" : "#fff",
                color: activeFilterCount > 0 ? "white" : "inherit",
                boxShadow: 1,
                padding: "8px",
                "&:hover": {
                  backgroundColor: activeFilterCount > 0 ? "primary.dark" : "#f5f5f5",
                },
              }}
            >
              <Badge badgeContent={activeFilterCount} color="error" overlap="circular" 
                sx={{ "& .MuiBadge-badge": { right: -2, top: -2, border: `2px solid ${activeFilterCount > 0 ? theme.palette.primary.main : "#fff"}` } }}>
                <FilterAltIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Popover
            open={filterOpen}
            anchorEl={filterAnchor}
            onClose={closeFilter}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 500,
                mt: 1,
                borderRadius: 3,
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              },
            }}
          >
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f8faff" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a2027" }}>
                Filter Leads
              </Typography>
              {activeFilterCount > 0 && (
                <Button 
                  size="small" 
                  onClick={onClearAllFilters}
                  sx={{ textTransform: "none", color: "error.main", fontWeight: 600 }}
                  startIcon={<Clear sx={{ fontSize: 16 }} />}
                >
                  Clear All
                </Button>
              )}
            </Box>
            
            <Divider />

            <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
              {[
                { label: "Lead Status", icon: <InfoIcon />, items: LEAD_STATUSES, selected: selectedStatuses, onChange: onStatusesChange, color: "primary.main" },
                { label: "Lead Type", icon: <TrendingUpIcon />, items: LEAD_TYPES, selected: selectedLeadTypes, onChange: onLeadTypesChange, color: "warning.main" },
                { label: "Property", icon: <HomeIcon />, items: uniqueProperties, selected: selectedProperties, onChange: onPropertiesChange, color: "success.main", scrollable: true },
                { label: "Budget Range", icon: <MoneyIcon />, items: budgetRanges, selected: selectedBudgets, onChange: onBudgetsChange, color: "error.main" },
                { label: "Team Members", icon: <PeopleIcon />, items: teamMembers, selected: selectedAssignedTo, onChange: onAssignedToChange, color: "info.main", isTeam: true }
              ].map((section, idx) => (
                <React.Fragment key={section.label}>
                  <Accordion 
                    elevation={0} 
                    disableGutters
                    defaultExpanded={idx === 0}
                    sx={{ 
                      "&:before": { display: "none" },
                      "&.Mui-expanded": { m: 0 },
                      "& .MuiAccordionSummary-root": {
                        minHeight: 52,
                        transition: "background-color 0.2s",
                        "&.Mui-expanded": { minHeight: 52 },
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                        "& .MuiAccordionSummary-content": { m: "12px 0", "&.Mui-expanded": { m: "12px 0" } },
                        "& .MuiAccordionSummary-expandIconWrapper": { color: "text.disabled" },
                        // Remove focus ring
                        "&.Mui-focusVisible": { bgcolor: alpha(theme.palette.primary.main, 0.08), outline: "none" }
                      }
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                        {React.cloneElement(section.icon as React.ReactElement, { sx: { fontSize: 20, color: section.color } })}
                        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.primary", textTransform: "uppercase", letterSpacing: 1.2, flexGrow: 1 }}>
                          {section.label}
                        </Typography>
                        {section.selected.length > 0 && (
                          <Chip 
                            label={section.selected.length} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              minWidth: 20,
                              fontSize: "0.7rem", 
                              fontWeight: 800,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }} 
                          />
                        )}
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 2, px: 3 }}>
                      <Stack 
                        spacing={0} 
                        sx={section.scrollable || section.isTeam ? { 
                          maxHeight: 200, 
                          overflowY: "auto",
                          pr: 1,
                          "&::-webkit-scrollbar": { width: "4px" },
                          "&::-webkit-scrollbar-thumb": { background: alpha(theme.palette.divider, 0.1), borderRadius: "4px" }
                        } : {}}
                      >
                        {section.items.length > 0 ? (
                          section.items.map((item: any) => {
                            const isString = typeof item === "string";
                            const id = isString ? item : item._id;
                            const label = isString ? item : (
                              <Box>
                                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{item.name}</Typography>
                                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{item.designation}</Typography>
                              </Box>
                            );

                            return (
                              <FormControlLabel
                                key={id}
                                sx={{ 
                                  ml: -0.5, 
                                  mr: 0,
                                  "&:hover .MuiCheckbox-root": { color: "primary.main" } 
                                }}
                                control={
                                  <Checkbox 
                                    size="small" 
                                    checked={section.selected.includes(id)}
                                    onChange={() => {
                                      const newVal = section.selected.includes(id)
                                        ? section.selected.filter((v: any) => v !== id)
                                        : [...section.selected, id];
                                      section.onChange(newVal);
                                    }}
                                    sx={{ py: 0.6 }}
                                  />
                                }
                                label={<Box sx={{ fontSize: "0.85rem", color: section.selected.includes(id) ? "text.primary" : "text.secondary", fontWeight: section.selected.includes(id) ? 600 : 400, transform: "translateY(1px)", transition: "all 0.2s" }}>{label}</Box>}
                              />
                            );
                          })
                        ) : (
                          <Typography sx={{ fontSize: "0.8rem", color: "text.disabled", py: 1, textAlign: "center", fontStyle: "italic" }}>
                            No options available
                          </Typography>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                  {idx < 4 && <Divider sx={{ opacity: 0.6 }} />}
                </React.Fragment>
              ))}
            </Box>

            <Box sx={{ p: 2, bgcolor: "#fff", borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={closeFilter}
                sx={{ 
                  borderRadius: 2.5, 
                  textTransform: "none", 
                  fontWeight: 700,
                  py: 1.2,
                  fontSize: "0.95rem",
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                  "&:hover": { 
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transform: "translateY(-1px)"
                  },
                  transition: "all 0.2s ease"
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Popover>
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
                  }}
                >
                  <DownloadIcon fontSize="small" />
                  {isTablet ? "Template" : "Download Template"}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    closeActionsMenu();
                    setBulkUploadDialogOpen(true);
                  }}
                  sx={{
                    borderRadius: 1,
                    gap: 1.5,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 600,
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
                        "bulk-assign-trigger"
                      );
                      trigger?.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
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
              <BulkAssign
                onSuccess={loadLeads}
                hideButton
                buttonId="bulk-assign-trigger"
              />
            </Box>
          </Box>
        </PermissionGuard>
      </Box>

      {/* Upload Status Dialog */}
      <CheckUploadStatusDialog
        open={uploadStatusOpen}
        onClose={() => setUploadStatusOpen(false)}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialogDynamic
        open={bulkUploadDialogOpen}
        onClose={() => setBulkUploadDialogOpen(false)}
        loadLeads={loadLeads}
      />
    </Box>
  );
};

export default LeadsActionBar;
