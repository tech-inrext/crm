import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/ui/permission/PermissionGuard";
import { USERS_PERMISSION_MODULE, SEARCH_PLACEHOLDER } from "@/constants/users";

interface UsersActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

const UsersActionBar: React.FC<UsersActionBarProps> = ({
  search,
  onSearchChange,
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
        mb: { xs: 1, md: 2 },
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "auto" }, flex: 1 }}>
        <SearchBar
          sx={{ width: "100%", minWidth: 280 }}
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>
      {!isMobile && (
        <PermissionGuard
          module={USERS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            disabled={saving}
            size="large"
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
              "Add User"
            )}
          </Button>
        </PermissionGuard>
      )}
    </Box>
  );
};

export default UsersActionBar;
