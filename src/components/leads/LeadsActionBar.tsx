import React, { useState } from "react";
import {
  Box,
  MenuItem,
  Menu,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
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
import { MoreVert } from "@mui/icons-material";
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
}) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [uploadStatusOpen, setUploadStatusOpen] = useState(false);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);

  const openMobileMenu = (e: React.MouseEvent<HTMLElement>) =>
    setMobileAnchor(e.currentTarget);
  const closeMobileMenu = () => setMobileAnchor(null);

  const mobileMenuOpen = Boolean(mobileAnchor);
  const actionsMenuOpen = Boolean(actionsAnchor);

  const openActionsMenu = (e: React.MouseEvent<HTMLElement>) =>
    setActionsAnchor(e.currentTarget);
  const closeActionsMenu = () => setActionsAnchor(null);

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
            minWidth: 0, // allow child to shrink below its intrinsic width
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
          <Tooltip title="Filter status">
            <IconButton
              size="small"
              onClick={openMobileMenu}
              sx={{
                backgroundColor:
                  selectedStatuses.length > 0 ? "primary.main" : "#fff",
                color: selectedStatuses.length > 0 ? "white" : "inherit",
                boxShadow: 1,
                "&:hover": {
                  backgroundColor:
                    selectedStatuses.length > 0 ? "primary.dark" : "#f5f5f5",
                },
              }}
              aria-controls={mobileMenuOpen ? "mobile-status-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={mobileMenuOpen ? "true" : undefined}
            >
              <FilterAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            id="mobile-status-menu"
            anchorEl={mobileAnchor}
            open={mobileMenuOpen}
            onClose={closeMobileMenu}
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
                  style={{ cursor: "pointer" }}
                />
                <Box
                  component="span"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 600,
                    fontSize: "0.9rem",
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
                }}
              >
                Clear All
              </MenuItem>
            )}
          </Menu>
        </Box>

        {/* Action Menu */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              order: { xs: 3, sm: 3 },
            }}
          >
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
                    const input = document.getElementById(
                      "bulk-upload-excel"
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
                      {isTablet ? (
                        <Add fontSize="small" />
                      ) : (
                        <PersonAdd fontSize="small" />
                      )}
                      Add Lead
                    </>
                  )}
                </MenuItem>
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

      {/* Upload Status Dialog */}
      <CheckUploadStatusDialog
        open={uploadStatusOpen}
        onClose={() => setUploadStatusOpen(false)}
      />
    </Box>
  );
};

export default LeadsActionBar;
