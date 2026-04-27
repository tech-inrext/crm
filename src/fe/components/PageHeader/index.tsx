"use client";

import React from "react";
import { Paper, Typography, Box } from "@/components/ui/Component";

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
}) => {
  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 2.5, md: 3 },
        mt: 0,
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, md: 3 },
        alignItems: "flex-start",
        position: "relative",
        overflow: "visible",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            color: "text.primary",
            mb: 0,
            textAlign: "left",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              textAlign: "left",
              mt: 0.5,
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {children && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, md: 2 },
            alignItems: "stretch",
          }}
        >
          {children}
        </Box>
      )}
    </Paper>
  );
};

export default PageHeader;
