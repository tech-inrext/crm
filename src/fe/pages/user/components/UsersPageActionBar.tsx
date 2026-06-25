"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Add, Button, PermissionGuard, Box, alpha, useTheme } from "@/components/ui";
import SearchBar from "@/components/ui/search/SearchBar";
import {
  USERS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/user/constants/users";
import { Props } from "@/fe/pages/user/types";

const UsersPageActionBar: React.FC<Props> = ({
  search,
  onSearchChange,
  onAdd,
  showAllEmployees,
  onToggleAllEmployees,
  isSystemAdmin,
}) => {
  const theme = useTheme();

  return (
    <PageHeader title="Business Partners">
      {/* Search — grows to fill available space, capped on desktop */}
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: { sm: 400 } }}>
        <SearchBar
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.8),
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: theme.palette.common.white,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              },
              "&.Mui-focused": {
                bgcolor: theme.palette.common.white,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            },
          }}
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>

      {/* Action buttons — pinned right, never stretch */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1.5,
          ml: { xs: 0, sm: "auto" },
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {isSystemAdmin && (
          <Button
            variant={showAllEmployees ? "outlined" : "contained"}
            onClick={onToggleAllEmployees}
            size="small"
            sx={{
              height: 40,
              px: 2,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              flex: { xs: 1, sm: "none" },
              ...(showAllEmployees
                ? {
                    bgcolor: "#fff",
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    color: "text.primary",
                    "&:hover": { bgcolor: alpha(theme.palette.divider, 0.05) },
                  }
                : {
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
                    },
                  }),
            }}
          >
            {showAllEmployees ? "My Team" : "All Employees"}
          </Button>
        )}

        <PermissionGuard
          module={USERS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Button
            variant="contained"
            onClick={onAdd}
            startIcon={<Add />}
            size="small"
            sx={{
              height: 40,
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              flex: { xs: 1, sm: "none" },
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
              },
            }}
          >
            Add User
          </Button>
        </PermissionGuard>
      </Box>
    </PageHeader>
  );
};

export default UsersPageActionBar;
