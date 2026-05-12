"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { PermissionGuard } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import {
  ROLES_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/roles/constants/roles";
import { RolesPageActionBarProps } from "@/fe/pages/roles/types";

import { Button, Box, useTheme, alpha } from "@/components/ui/Component";
import { Add as AddIcon } from "@mui/icons-material";

const RolesPageActionBar: React.FC<RolesPageActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
}) => {
  const theme = useTheme();

  return (
    <PageHeader title="Roles" sx={{ mb: 0 }}>
      {/* Search — grows to fill available space, capped on desktop */}
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: { sm: 400 } }}>
        <SearchBar
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "action.hover",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "action.selected",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              },
              "&.Mui-focused": {
                bgcolor: "background.paper",
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
        <PermissionGuard
          module={ROLES_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Button
            variant="contained"
            onClick={onAdd}
            startIcon={<AddIcon />}
            size="small"
            sx={{
              height: 40,
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              flex: { xs: 1, sm: "none" },
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
              },
            }}
          >
            Add Role
          </Button>
        </PermissionGuard>
      </Box>
    </PageHeader>
  );
};

export default RolesPageActionBar;
