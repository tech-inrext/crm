import React from "react";
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
import { Add, PersonAdd, ViewList, ViewModule } from "@mui/icons-material";
import SearchBar from "@/components/ui/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";

interface LeadsActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
  onAdd: () => void;
  saving: boolean;
}

const LeadsActionBar: React.FC<LeadsActionBarProps> = ({
  search,
  onSearchChange,
  viewMode,
  setViewMode,
  onAdd,
  saving,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 3 },
        alignItems: { xs: "stretch", md: "center" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 14 },
          justifyContent: { xs: "space-between", md: "flex-end" },
          order: { xs: 2, md: 1 },
        }}
      >
        {/* View Toggle - Compact on mobile */}
        {!isMobile && (
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
            {[
              { mode: "table", icon: ViewList, title: "Table View" },
              { mode: "cards", icon: ViewModule, title: "Card View" },
            ].map(({ mode, icon: Icon, title }) => (
              <Tooltip key={mode} title={title}>
                <IconButton
                  onClick={() => setViewMode(mode as "table" | "cards")}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    backgroundColor:
                      viewMode === mode ? "primary.main" : "action.hover",
                    color: viewMode === mode ? "white" : "text.primary",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  <Icon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        )}
        {/* Search Bar */}
        <Box sx={{ width: { xs: "100%", md: "auto" } }}>
          <SearchBar
            sx={{ width: "100%", md: "auto", minWidth: 280 }}
            value={search}
            onChange={onSearchChange}
            placeholder="Search leads by name, email, phone..."
          />
        </Box>
        {/* Add Button */}
        {!isMobile && (
          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={onAdd}
              disabled={saving}
              size={isMobile ? "medium" : "large"}
              sx={{
                minWidth: { xs: "auto", sm: 150 },
                height: { xs: 44, sm: 40 },
                borderRadius: 2,
                fontWeight: 600,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add Lead"
              )}
            </Button>
          </PermissionGuard>
        )}
      </Box>
    </Box>
  );
};

export default LeadsActionBar;
