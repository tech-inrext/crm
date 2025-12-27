import React, { useState } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Menu,
  CircularProgress,
  Fab,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@/components/ui/Component";
import {
  Add,
  PersonAdd,
  ViewList,
  ViewModule,
  History,
  FilterAltIcon,
} from "@/components/ui/Component";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [uploadStatusOpen, setUploadStatusOpen] = useState(false);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);

  const openMobileMenu = (e: React.MouseEvent<HTMLElement>) =>
    setMobileAnchor(e.currentTarget);
  const closeMobileMenu = () => setMobileAnchor(null);

  const mobileMenuOpen = Boolean(mobileAnchor);

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
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: { xs: "center", sm: "flex-end", md: "flex-end" },
          width: "100%",
        }}
      >
        {/* Search Bar */}
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            order: { xs: 1, sm: 1 },
            minWidth: 0, // allow child to shrink below its intrinsic width
          }}
        >
          <SearchBar
            sx={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              "& .MuiInputBase-input": {
                textAlign: "center",
              },
              "& .MuiInputBase-input::placeholder": {
                fontSize: "0.75rem !important",
                opacity: 1,
                textAlign: "center",
              },
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

        {/* Mobile-only status filter button (visible on small screens) */}
        {isMobile && (
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              alignItems: "center",
              ml: 1,
            }}
          >
            <Tooltip title="Filter status">
              <IconButton
                size="small"
                onClick={openMobileMenu}
                sx={{ background: "#fff", boxShadow: 1 }}
                aria-controls={
                  mobileMenuOpen ? "mobile-status-menu" : undefined
                }
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
              MenuListProps={{ sx: { minWidth: 200 } }}
            >
              <MenuItem
                onClick={() => {
                  onStatusesChange([]);
                  closeMobileMenu();
                }}
                sx={{
                  fontWeight: "bold",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
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
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(s)}
                    readOnly
                    style={{ cursor: "pointer" }}
                  />
                  <Box component="span" sx={{ textTransform: "capitalize" }}>
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
                  }}
                >
                  Clear All
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{
            width: { xs: "100%", sm: "auto" },
            alignItems: "stretch",
            order: { xs: 3, sm: 3 },
            // Prevent button text from wrapping and being clipped
            "& .MuiButton-root": {
              whiteSpace: "nowrap",
            },
          }}
        >
          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <BulkUpload loadLeads={loadLeads} />
          </PermissionGuard>

          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <BulkAssign onSuccess={loadLeads} />
          </PermissionGuard>

          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <Button
              variant="contained"
              startIcon={!isTablet ? <History /> : null}
              onClick={() => setUploadStatusOpen(true)}
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                height: 40,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.8rem",
                px: { xs: 2, sm: 3 },
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                outline: "none",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                  transform: "translateY(-1px)",
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
            >
              {isTablet ? "Upload Status" : "Check Upload Status"}
            </Button>
          </PermissionGuard>

          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <Button
              variant="contained"
              startIcon={!isTablet ? <PersonAdd /> : <Add />}
              onClick={onAdd}
              disabled={saving}
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                height: 40,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.8rem",
                px: { xs: 2, sm: 3 },
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                outline: "none",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                  transform: "translateY(-1px)",
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add Lead"
              )}{" "}
            </Button>
          </PermissionGuard>
        </Stack>
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
