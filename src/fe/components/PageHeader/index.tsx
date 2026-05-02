"use client";

import React from "react";
import { Paper, Typography, Box, SxProps, Theme } from "@/components/ui/Component";

interface PageHeaderProps {
  /** Page title rendered as an h4 */
  title: string;
  /** Optional subtitle shown below the title */
  subtitle?: string;
  /**
   * Slot for page-specific controls: search bars, buttons, filters, etc.
   * Each page passes its own ActionBar here — PageHeader stays generic.
   */
  children?: React.ReactNode;
  /** Extra className applied to the outer Paper */
  className?: string;
  /** Custom styles for the header */
  sx?: SxProps<Theme>;
}

/**
 * PageHeader – shared top-of-page chrome used by every module.
 *
 * Mirrors the existing LeadsActionBar look with proper Material-UI styling
 * but is open for extension via `children` so each page can slot in
 * its own action bar without touching this component.
 *
 * @example
 * <PageHeader title="Users">
 *   <UsersActionBar search={search} onSearchChange={…} onAdd={…} />
 * </PageHeader>
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
  className = "",
  sx = {},
}) => {
  return (
    <Paper
      elevation={2}
      className={className}
      sx={{
        p: 2,
        borderRadius: { xs: 1, sm: 2, md: 3 },
        mb: { xs: 1.5, sm: 2, md: 3 },
        mt: 0,
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        overflow: "visible",
        ...sx,
      }}
    >
      <Box sx={{ mb: { xs: 1.5, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.3rem", sm: "2rem", md: "2.5rem" },
            color: "text.primary",
            mb: 0,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              textAlign: { xs: "center", sm: "left" },
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {children && (
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
          {children}
        </Box>
      )}
    </Paper>
  );
};

export default PageHeader;
