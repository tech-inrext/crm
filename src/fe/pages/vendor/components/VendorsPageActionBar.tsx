"use client";

import React from "react";
import { PageHeader } from "@/fe/framework";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  VENDORS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/vendor/constants/vendors";
import { Button, Box, useTheme, alpha } from "@/components/ui/Component";
import { Add as AddIcon } from "@mui/icons-material";
import type { VendorsPageActionBarProps } from "@/fe/pages/vendor/types";

const VendorsPageActionBar: React.FC<VendorsPageActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving = false,
}) => {
  const theme = useTheme();

  return (
    <PageHeader title="Vendors" sx={{ mb: 0 }}>
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
          module={VENDORS_PERMISSION_MODULE}
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
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
              },
            }}
          >
            Add Vendor
          </Button>
        </PermissionGuard>
      </Box>
    </PageHeader>
  );
};

export default VendorsPageActionBar;