import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  PersonAdd,
  ViewList,
  ViewModule,
  History,
} from "@mui/icons-material";
import SearchBar from "@/components/ui/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import dynamic from "next/dynamic";

const BulkUpload = dynamic(() => import("@/components/leads/bulkUpload"), {
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
}

const LeadsActionBar: React.FC<LeadsActionBarProps> = ({
  search,
  onSearchChange,
  viewMode,
  setViewMode,
  onAdd,
  saving,
  loadLeads,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [uploadStatusOpen, setUploadStatusOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "column", md: "row" },
        gap: { xs: 1.5, sm: 2, md: 3 },
        alignItems: { xs: "stretch", md: "center" },
        width: "100%",
        overflow: "hidden",
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
            width: { xs: "100%", sm: "auto" },
            order: { xs: 1, sm: 1 },
          }}
        >
          <SearchBar
            sx={{
              width: { xs: "100%", sm: 280 },
              minWidth: { xs: "100%", sm: 280 },
              maxWidth: { xs: "100%", sm: 320 },
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

        {/* View Toggle */}
        {!isTablet && (
          <Stack
            direction="row"
            spacing={{ xs: 0.5, sm: 1 }}
            sx={{
              justifyContent: { xs: "center", sm: "flex-start" },
              order: { xs: 2, sm: 2 },
            }}
          >
            {[
              { mode: "table", icon: ViewList, title: "Table View" },
              { mode: "cards", icon: ViewModule, title: "Card View" },
            ].map(({ mode, icon: Icon, title }) => (
              <Tooltip key={mode} title={title}>
                <IconButton
                  onClick={() => setViewMode(mode as "table" | "cards")}
                  size="small"
                  sx={{
                    backgroundColor:
                      viewMode === mode ? "primary.main" : "action.hover",
                    color: viewMode === mode ? "white" : "text.primary",
                    "&:hover": { backgroundColor: "primary.dark" },
                    minWidth: 40,
                    height: 40,
                    outline: "none",
                    boxShadow: "none",
                    "&:focus": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        )}

        {/* Action Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{
            width: { xs: "100%", sm: "auto" },
            alignItems: "stretch",
            order: { xs: 3, sm: 3 },
          }}
        >
          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <BulkUpload loadLeads={loadLeads} />
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
