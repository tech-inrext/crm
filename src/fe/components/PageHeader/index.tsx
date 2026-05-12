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
 * Matches the Leads section layout exactly:
 *  - White Paper with subtle shadow + border
 *  - Big bold module title at top (same font weight & size as Leads)
 *  - Children (search + buttons) rendered below in a responsive row
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
      elevation={0}
      className={className}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 2, sm: 3, md: 4 },
        mb: 1,
        mt: 0,
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, md: 3 },
        alignItems: "flex-start",
        position: "relative",
        overflow: "visible",
        ...sx,
      }}
    >
      {/* Title block — matches MODULE_STYLES.layout.moduleTitle */}
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            letterSpacing: "-0.02em",
            mb: 0,
            textAlign: "left",
            width: "100%",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.82rem", sm: "0.9rem" },
              mt: 0.5,
              fontWeight: 400,
              opacity: 0.8,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Controls slot — search + buttons row, matching LeadsActionBar wrapper */}
      {children && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 2 },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {children}
        </Box>
      )}
    </Paper>
  );
};

export default PageHeader;
