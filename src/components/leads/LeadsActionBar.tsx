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
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
        width: "100%",
        overflow: "visible",
      }}
    >
      {/* Row 1: Search + Results Filter + Action Menu */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          width: "100%",
        }}
      >
        {/* Search Bar */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0, 
          }}
        >
          <SearchBar
            sx={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
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
            placeholder="Search leads..."
          />
        </Box>

        {/* Action Triggers (Filter + Menu) */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Filter Leads Toggle */}
          <Tooltip title="Filter results">
            <IconButton
              size="small"
              onClick={openFilter}
              sx={{
                backgroundColor: activeFilterCount > 0 ? "primary.main" : "#fff",
                color: activeFilterCount > 0 ? "white" : "inherit",
                boxShadow: 1,
                p: 1,
                "&:hover": {
                  backgroundColor: activeFilterCount > 0 ? "primary.dark" : "#f5f5f5",
                },
              }}
            >
              <Badge 
                badgeContent={activeFilterCount} 
                color="error" 
                overlap="circular" 
                sx={{ "& .MuiBadge-badge": { right: -2, top: -2, border: `2px solid ${activeFilterCount > 0 ? theme.palette.primary.main : "#fff"}` } }}
              >
                <FilterAltIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Leads Action Menu */}
          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <Tooltip title="Lead actions">
              <IconButton
                size="small"
                onClick={openActionsMenu}
                sx={{ background: "#fff", boxShadow: 1, p: 1 }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </PermissionGuard>
        </Stack>
      </Box>

      {/* Row 2: Team Members + Mode Selectors (Side-by-side on mobile) */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: 0.5, 
          width: "100%", 
          alignItems: "center",
          flexWrap: "nowrap"
        }}
      >
        {/* Team Selector */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Button
            onClick={openTeamFilter}
            endIcon={<ExpandMore sx={{ transform: teamOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
            startIcon={<PeopleIcon sx={{ color: selectedAssignedTo.length > 0 ? "primary.main" : "text.secondary" }} />}
            sx={{
              width: "100%",
              height: 40,
              px: { xs: 0.5, sm: 1.5 },
              borderRadius: 2,
              bgcolor: selectedAssignedTo.length > 0 ? alpha(theme.palette.primary.main, 0.08) : "#fff",
              border: `1px solid ${selectedAssignedTo.length > 0 ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8)}`,
              color: selectedAssignedTo.length > 0 ? "primary.main" : "text.primary",
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.85rem" },
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: selectedAssignedTo.length > 0 ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.divider, 0.05),
                borderColor: selectedAssignedTo.length > 0 ? "primary.main" : alpha(theme.palette.divider, 1),
              },
            }}
          >
            <Typography 
              component="span" 
              sx={{ 
                fontSize: "inherit", 
                fontWeight: "inherit",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                maxWidth: "100%"
              }}
            >
              {selectedAssignedTo.length > 0 
                ? (teamMembers.find(m => m._id === selectedAssignedTo[0])?.name || `${selectedAssignedTo.length} Team`)
                : "Team Members"}
            </Typography>
          </Button>
        </Box>

        {/* Mode Selector (Side-by-side with Team) */}
        {selectedAssignedTo.length > 0 && selectedAssignedTo[0] !== "unassigned" && (
          <>
            <ArrowForward sx={{ color: "text.secondary", fontSize: 16, opacity: 0.4, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Button
                onClick={openModeFilter}
                endIcon={<ExpandMore sx={{ transform: modeOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
                sx={{
                  width: "100%",
                  height: 40,
                px: { xs: 0.5, sm: 1.5 },
                borderRadius: 2,
                bgcolor: "#fff",
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                color: "text.primary",
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.85rem" },
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: alpha(theme.palette.divider, 0.05),
                  borderColor: alpha(theme.palette.divider, 1),
                },
              }}
            >
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: "inherit", 
                  fontWeight: "inherit",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  maxWidth: "100%"
                }}
              >
                {assignedToMode === "hierarchy" ? "Incl. Members" : "Directly Assigned"}
              </Typography>
            </Button>
          </Box>
        </>
      )}

        {/* Add Lead Button - Desktop only in this row, on mobile it's in the more menu */}
        {!isTablet && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={onAdd}
            disabled={saving}
            sx={{
              minWidth: 140,
              height: 40,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              backgroundColor: "#e8f1ff",
              color: "#1e5fbf",
              boxShadow: "none",
              border: "1px solid rgba(30, 95, 191, 0.18)",
              "&:hover": {
                backgroundColor: "#deebff",
                borderColor: "rgba(30, 95, 191, 0.28)",
                boxShadow: "none",
              },
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Add Lead"}
          </Button>
        )}
      </Box>

      {/* --- POPUPS & DIALOGS (Hidden from layout) --- */}

      {/* 1. Team Filter Popover */}
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
              sx: { borderRadius: 2, fontSize: "0.85rem", bgcolor: alpha(theme.palette.divider, 0.03) }
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
                      "&:hover": { bgcolor: alpha(theme.palette.divider, 0.05) }
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700, bgcolor: isSelected ? "primary.main" : alpha(theme.palette.primary.main, 0.1), color: isSelected ? "#fff" : "primary.main", mr: 1.5 }}>
                      {initials}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? "primary.main" : "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </Typography>
                    </Box>
                    {isSelected && <Check sx={{ fontSize: 18, color: "primary.main", ml: 1 }} />}
                  </Box>
                );
              })
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontStyle: "italic" }}>No results</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Popover>

      {/* 2. Mode Filter Popover */}
      <Popover
        open={modeOpen}
        anchorEl={modeAnchor}
        onClose={closeModeFilter}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { width: 220, mt: 1, borderRadius: 2.5, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" },
        }}
      >
        <Box sx={{ py: 1 }}>
          <MenuItem
            selected={assignedToMode === "direct"}
            onClick={() => { onAssignedToModeChange("direct"); closeModeFilter(); }}
            sx={{ px: 2, py: 1.2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}
          >
            <Stack>
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>Directly Assigned</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>Only leads assigned to this person</Typography>
            </Stack>
          </MenuItem>
          <MenuItem
            selected={assignedToMode === "hierarchy"}
            onClick={() => { onAssignedToModeChange("hierarchy"); closeModeFilter(); }}
            sx={{ px: 2, py: 1.2 }}
          >
            <Stack>
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>Incl. Team Members</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>All leads assigned to their hierarchy</Typography>
            </Stack>
          </MenuItem>
        </Box>
      </Popover>

      {/* 3. Results Filter Popover */}
      <Popover
        open={filterOpen}
        anchorEl={filterAnchor}
        onClose={closeFilter}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { width: 320, maxHeight: 500, mt: 1, borderRadius: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "column" },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f8faff" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a2027" }}>Filter Leads</Typography>
          {activeFilterCount > 0 && (
            <Button size="small" onClick={onClearPanelFilters} sx={{ textTransform: "none", color: "error.main", fontWeight: 600 }} startIcon={<Clear sx={{ fontSize: 16 }} />}>
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
                elevation={0} disableGutters defaultExpanded={idx === 0}
                sx={{ "&:before": { display: "none" }, "&.Mui-expanded": { m: 0 }, "& .MuiAccordionSummary-root": { minHeight: 52, transition: "background-color 0.2s", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) } } }}
              >
                <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                    {React.cloneElement(section.icon as React.ReactElement, { sx: { fontSize: 20, color: section.color } })}
                    <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1.2, flexGrow: 1 }}>{section.label}</Typography>
                    {section.selected.length > 0 && <Chip label={section.selected.length} size="small" sx={{ height: 20, minWidth: 20, fontSize: "0.7rem", fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2, px: 3 }}>
                  <Stack spacing={0} sx={section.scrollable ? { maxHeight: 200, overflowY: "auto", pr: 1 } : {}}>
                    {section.items.length > 0 ? (
                      section.items.map((item: any, itmIdx: number) => {
                        const id = typeof item === "string" ? item : item._id;
                        const isSelected = section.selected.includes(id);
                        const name = typeof item === "string" ? item : item.name;
                        return (
                          <React.Fragment key={id}>
                            <Box onClick={() => { const newVal = isSelected ? section.selected.filter(v => v !== id) : [...section.selected, id]; section.onChange(newVal); }} sx={{ py: 0.8, px: 1, borderRadius: 1.5, cursor: "pointer", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) }, bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.03) : "transparent" }}>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Checkbox size="small" checked={isSelected} sx={{ p: 0, "&.Mui-checked": { color: section.color } }} />
                                <Typography sx={{ fontSize: "0.85rem", fontWeight: isSelected ? 600 : 500 }}>{name}</Typography>
                              </Stack>
                            </Box>
                            {itmIdx < section.items.length - 1 && <Divider sx={{ my: 0.2, opacity: 0.3 }} />}
                          </React.Fragment>
                        );
                      })
                    ) : <Typography sx={{ fontSize: "0.8rem", color: "text.disabled", py: 1, textAlign: "center" }}>No options</Typography>}
                  </Stack>
                </AccordionDetails>
              </Accordion>
              {idx < 3 && <Divider sx={{ opacity: 0.6 }} />}
            </React.Fragment>
          ))}
        </Box>
      </Popover>

      {/* 4. Action Menu (MoreTriggers) */}
      <Menu id="lead-actions-menu" anchorEl={actionsAnchor} open={actionsMenuOpen} onClose={closeActionsMenu} MenuListProps={{ sx: { p: 0.5 } }}>
        <Stack direction="column" spacing={0.5} sx={{ minWidth: 220 }}>
          {/* Mobile Only: Add Lead Button */}
          {isTablet && (
            <MenuItem onClick={() => { onAdd(); closeActionsMenu(); }} disabled={saving} sx={{ borderRadius: 1, gap: 1.5, py: 1, px: 1.5 }}>
              {saving ? <CircularProgress size={18} color="inherit" /> : <><Add fontSize="small" /><Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Add Lead</Typography></>}
            </MenuItem>
          )}

          <MenuItem
            onClick={async () => {
              try {
                const XLSX = await import("xlsx");
                const data = [
                  ["fullName", "email", "phone"],
                  ["Sample Lead Name 1", "lead1@gmail.com", "7500000001"],
                  ["Sample Lead Name 2", "(leave blank if not available)", "7500000002"],
                  ["Sample Lead Name 3", "lead3@gmail.com", "7500000003"],
                  ["Sample Lead Name 4", "(leave blank if not available)", "7500000004"],
                  ["(leave blank if not available)", "lead5@gmail.com", "7500000005"],
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
            sx={{ borderRadius: 1, gap: 1.5, py: 1, px: 1.5 }}
          >
            <DownloadIcon fontSize="small" />
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Download Template</Typography>
          </MenuItem>

          <MenuItem onClick={() => { closeActionsMenu(); setBulkUploadDialogOpen(true); }} sx={{ borderRadius: 1, gap: 1.5, py: 1, px: 1.5 }}>
            <UploadFile fontSize="small" /><Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Bulk Upload</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              closeActionsMenu();
              setTimeout(() => {
                const trigger = document.getElementById("bulk-assign-trigger");
                trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              }, 0);
            }}
            sx={{ borderRadius: 1, gap: 1.5, py: 1, px: 1.5 }}
          >
            <AssignmentInd fontSize="small" />
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Bulk Assign</Typography>
          </MenuItem>

          <MenuItem onClick={() => { closeActionsMenu(); setUploadStatusOpen(true); }} sx={{ borderRadius: 1, gap: 1.5, py: 1, px: 1.5 }}>
            <History fontSize="small" /><Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Check Status</Typography>
          </MenuItem>
        </Stack>
      </Menu>

      {/* Hidden Dialogs/Logic */}
      <Box sx={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <BulkAssign onSuccess={loadLeads} hideButton buttonId="bulk-assign-trigger" />
      </Box>

      <CheckUploadStatusDialog open={uploadStatusOpen} onClose={() => setUploadStatusOpen(false)} />
      
      <BulkUploadDialogDynamic open={bulkUploadDialogOpen} onClose={() => setBulkUploadDialogOpen(false)} loadLeads={loadLeads} />

    </Box>
  );
};

export default LeadsActionBar;
