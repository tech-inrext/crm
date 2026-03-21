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
  CurrencyRupee as RupeeIcon,
  People as PeopleIcon,
  ArrowForward,
  Avatar,
  Check,
  SearchIcon,
  TextField,
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
  assignedToMode: "direct" | "hierarchy";
  onAssignedToModeChange: (mode: "direct" | "hierarchy") => void;
  onClearAllFilters?: () => void;
  onClearPanelFilters?: () => void;
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
  assignedToMode,
  onAssignedToModeChange,
  onClearAllFilters,
  onClearPanelFilters,
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

  const [teamAnchor, setTeamAnchor] = useState<null | HTMLElement>(null);
  const [modeAnchor, setModeAnchor] = useState<null | HTMLElement>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const teamOpen = Boolean(teamAnchor);
  const modeOpen = Boolean(modeAnchor);
  
  const filteredTeamMembers = useMemo(() => {
    if (!teamSearch.trim()) return teamMembers;
    const searchLow = teamSearch.toLowerCase();
    return teamMembers.filter(m => 
      m.name?.toLowerCase().includes(searchLow) || 
      m.designation?.toLowerCase().includes(searchLow)
    );
  }, [teamMembers, teamSearch]);

  const openTeamFilter = (e: React.MouseEvent<HTMLElement>) => {
    setTeamAnchor(e.currentTarget);
    setTeamSearch(""); // Reset search on open
  };
  const closeTeamFilter = () => setTeamAnchor(null);
  const openModeFilter = (e: React.MouseEvent<HTMLElement>) => setModeAnchor(e.currentTarget);
  const closeModeFilter = () => setModeAnchor(null);

  const activeFilterCount = 
    selectedStatuses.length + 
    selectedLeadTypes.length + 
    selectedProperties.length + 
    selectedBudgets.length;

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

        {/* Team Members Dropdown */}
        <Box sx={{ order: { xs: 2, sm: 2 } }}>
          <Button
            onClick={openTeamFilter}
            endIcon={<ExpandMore sx={{ transform: teamOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
            startIcon={<PeopleIcon sx={{ color: selectedAssignedTo.length > 0 ? "primary.main" : "text.secondary" }} />}
            sx={{
              height: 40,
              px: 2,
              borderRadius: 2,
              bgcolor: selectedAssignedTo.length > 0 ? alpha(theme.palette.primary.main, 0.08) : "#fff",
              border: `1px solid ${selectedAssignedTo.length > 0 ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8)}`,
              color: selectedAssignedTo.length > 0 ? "primary.main" : "text.primary",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: selectedAssignedTo.length > 0 ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.divider, 0.05),
                borderColor: selectedAssignedTo.length > 0 ? "primary.main" : alpha(theme.palette.divider, 1),
              },
            }}
          >
            {selectedAssignedTo.length > 0 
              ? (teamMembers.find(m => m._id === selectedAssignedTo[0])?.name || `${selectedAssignedTo.length} Team Member${selectedAssignedTo.length > 1 ? "s" : ""}`)
              : "Team Members"}
          </Button>

          <Popover
            open={teamOpen}
            anchorEl={teamAnchor}
            onClose={closeTeamFilter}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
              sx: {
                width: 280,
                maxHeight: 400,
                mt: 1,
                borderRadius: 2.5,
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              },
            }}
          >
            <Box sx={{ py: 1.5, px: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f8faff" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Select Team
              </Typography>
              {selectedAssignedTo.length > 0 && (
                <Typography 
                  onClick={() => onAssignedToChange([])}
                  sx={{ 
                    fontSize: "0.75rem", 
                    color: "primary.main", 
                    cursor: "pointer", 
                    fontWeight: 700,
                    "&:hover": { textDecoration: "underline" } 
                  }}
                >
                  Clear
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search team..."
                value={teamSearch}
                onChange={(e: any) => setTeamSearch(e.target.value)}
                autoFocus
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />,
                  sx: { 
                    borderRadius: 2,
                    fontSize: "0.85rem",
                    bgcolor: alpha(theme.palette.divider, 0.03)
                  }
                }}
              />
            </Box>
            
            <Box sx={{ p: 0.8, overflowY: "auto", flexGrow: 1, minHeight: 100 }}>
              <Stack spacing={0.2}>
                {filteredTeamMembers.length > 0 ? (
                  filteredTeamMembers.map((item: any) => {
                    const id = item._id;
                    const isSelected = selectedAssignedTo.includes(id);
                    const initials = item.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "?";
                    
                    return (
                      <Box
                        key={id}
                        onClick={() => {
                          const newVal = isSelected ? [] : [id];
                          onAssignedToChange(newVal);
                          if (!isSelected) closeTeamFilter();
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          py: 1,
                          px: 1.2,
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "0.2s all",
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                          "&:hover": { 
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.divider, 0.05),
                            "& .arrow-icon": { transform: "translateX(2px)", opacity: 1 }
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: "0.75rem", 
                            fontWeight: 700,
                            bgcolor: isSelected ? "primary.main" : alpha(theme.palette.primary.main, 0.1),
                            color: isSelected ? "#fff" : "primary.main",
                            mr: 1.5
                          }}
                        >
                          {initials}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography sx={{ 
                            fontSize: "0.85rem", 
                            fontWeight: isSelected ? 700 : 500, 
                            color: isSelected ? "primary.main" : "text.primary", 
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {item.name}
                          </Typography>
                          {item.designation && (
                            <Typography sx={{ 
                              fontSize: "0.7rem", 
                              color: isSelected ? alpha(theme.palette.primary.main, 0.7) : "text.secondary", 
                              mt: 0.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {item.designation}
                            </Typography>
                          )}
                        </Box>
                        
                        {isSelected && (
                          <Check sx={{ fontSize: 18, color: "primary.main", ml: 1 }} />
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontStyle: "italic" }}>
                      No results for "{teamSearch}"
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Popover>
        </Box>

        {/* Assigned Mode Dropdown */}
        {selectedAssignedTo.length > 0 && selectedAssignedTo[0] !== "unassigned" && (
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "row", 
              alignItems: "center",
              order: { xs: 2, sm: 2 },
              gap: 1.5
            }}
          >
            <ArrowForward sx={{ color: "text.secondary", fontSize: 20, opacity: 0.6 }} />
            <Box>
              <Button
                onClick={openModeFilter}
                endIcon={<ExpandMore sx={{ transform: modeOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
                sx={{
                  height: 40,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.divider, 0.05),
                    borderColor: alpha(theme.palette.divider, 1),
                  },
                }}
              >
                {assignedToMode === "hierarchy" ? "Incl. Team Members" : "Directly Assigned"}
              </Button>

              <Popover
                open={modeOpen}
                anchorEl={modeAnchor}
                onClose={closeModeFilter}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    width: 220,
                    mt: 1,
                    borderRadius: 2.5,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box sx={{ py: 1 }}>
                  <MenuItem
                    selected={assignedToMode === "direct"}
                    onClick={() => {
                      onAssignedToModeChange("direct");
                      closeModeFilter();
                    }}
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                      "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                    }}
                  >
                    <Stack>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}>
                        Directly Assigned
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                        Only leads assigned to this person
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem
                    selected={assignedToMode === "hierarchy"}
                    onClick={() => {
                      onAssignedToModeChange("hierarchy");
                      closeModeFilter();
                    }}
                    sx={{
                      px: 2,
                      py: 1.2,
                      "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                    }}
                  >
                    <Stack>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}>
                        Incl. Team Members
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                        All leads assigned to their hierarchy
                      </Typography>
                    </Stack>
                  </MenuItem>
                </Box>
              </Popover>
            </Box>
          </Box>
        )}


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
                  onClick={onClearPanelFilters}
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
                { label: "Budget Range", icon: <RupeeIcon />, items: budgetRanges, selected: selectedBudgets, onChange: onBudgetsChange, color: "error.main" },
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
                          section.items.map((item: any, itemIdx: number) => {
                            const isString = typeof item === "string";
                            const id = isString ? item : item._id;
                            const isSelected = section.selected.includes(id);
                            const name = isString ? item : item.name;
                            const designation = isString ? null : item.designation;

                            return (
                              <React.Fragment key={id}>
                                <Box
                                  onClick={() => {
                                    const newVal = isSelected
                                      ? section.selected.filter((v: any) => v !== id)
                                      : [...section.selected, id];
                                    section.onChange(newVal);
                                  }}
                                  sx={{
                                    py: 0.8,
                                    px: 1,
                                    my: 0.1,
                                    borderRadius: 1.5,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    },
                                    ...(isSelected && {
                                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    }),
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Checkbox
                                      size="small"
                                      checked={isSelected}
                                      sx={{
                                        p: 0,
                                        mr: 1.5,
                                        color: alpha(theme.palette.text.secondary, 0.4),
                                        "&.Mui-checked": {
                                          color: section.color || "primary.main",
                                        },
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: isSelected ? 600 : 500,
                                        color: isSelected
                                          ? section.color || "primary.main"
                                          : "text.primary",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {name}
                                    </Typography>
                                  </Box>
                                  {designation && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.72rem",
                                        color: isSelected
                                          ? alpha(theme.palette.primary.main, 0.6)
                                          : "text.secondary",
                                        ml: 4.1, // Aligns exactly below the start of the name text (Checkbox width + margin)
                                        lineHeight: 1,
                                        mt: -0.2, // Tweak to pull closer to name
                                        fontWeight: 400,
                                      }}
                                    >
                                      {designation}
                                    </Typography>
                                  )}
                                </Box>
                                {itemIdx < section.items.length - 1 && (
                                  <Divider sx={{ mx: 0.5, opacity: 0.3 }} />
                                )}
                              </React.Fragment>
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
                  {idx < 3 && <Divider sx={{ opacity: 0.6 }} />}
                </React.Fragment>
              ))}
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
