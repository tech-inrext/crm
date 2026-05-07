"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  DEPARTMENTS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/department/constants/departments";
import type { DepartmentsActionBarProps } from "@/fe/pages/department/types";

import { Button, Box, useTheme, alpha } from "@/components/ui/Component";
import { Add as AddIcon } from "@mui/icons-material";

const DepartmentsPageActionBar: React.FC<DepartmentsActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  const theme = useTheme();

  return (
    <PageHeader title="Departments" sx={{ mb: 0 }}>
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
        <PermissionGuard
          module={DEPARTMENTS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Button
            variant="contained"
            onClick={onAdd}
            disabled={saving}
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
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
              },
            }}
          >
            Add Department
          </Button>
        </PermissionGuard>
      </Box>
    </PageHeader>
  );
};

export default DepartmentsPageActionBar;
