import React from "react";
import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Extend SidebarLink type to allow onClick for label links
export type SidebarLink =
  | { kind: "header"; title: string }
  | { kind: "divider" }
  | {
      label: string;
      href: string;
      icon?: React.ReactNode;
      children?: SidebarLink[];
      onClick?: () => void;
    };

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  links?: SidebarLink[];
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, links = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // More aggressive mobile breakpoint
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const sidebarContent = (
    <Box
      sx={{
        width: { xs: 260, sm: 280, md: 300, lg: 260 }, // Better responsive width
        height: "100%",
        background: "linear-gradient(180deg, #181C1F 0%, #1a1f23 100%)",
        color: "#fff",
        borderRight: "1px solid #23272A",
        overflow: "hidden",
      }}
    >
      {" "}
      <List
        sx={{
          py: { xs: 0.5, sm: 1, md: 2 }, // Reduced padding on mobile
          px: { xs: 0.5, sm: 1 }, // Reduced horizontal padding
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {links.map((link, idx) => {
          if ("kind" in link && link.kind === "header") {
            return (
              <Typography
                key={link.title + idx}
                sx={{
                  px: 2,
                  py: { xs: 0.5, sm: 1 },
                  fontSize: { xs: 11, sm: 13 },
                  color: "#b0b8c1",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mt: idx > 0 ? { xs: 1, sm: 2 } : 0,
                }}
              >
                {link.title}
              </Typography>
            );
          }
          if ("kind" in link && link.kind === "divider") {
            return (
              <Divider
                key={idx}
                sx={{
                  my: { xs: 0.5, sm: 1 },
                  bgcolor: "#23272A",
                  mx: 1,
                }}
              />
            );
          }
          if (!("kind" in link)) {
            return (
              <ListItemButton
                key={link.href}
                onClick={() => {
                  if (typeof link.onClick === "function") link.onClick();
                  if (isMobile || isTablet) onClose(); // Auto-close on mobile and tablet
                }}
                sx={{
                  color: "#fff",
                  borderRadius: { xs: 1, sm: 2 },
                  mx: { xs: 0.25, sm: 0.5, md: 1 }, // Reduced margin on mobile
                  mb: { xs: 0.25, sm: 0.5 }, // Reduced bottom margin
                  py: { xs: 0.75, sm: 1, md: 1.5 }, // Better responsive padding
                  px: { xs: 0.75, sm: 1, md: 2 }, // Responsive horizontal padding
                  minHeight: { xs: 36, sm: 40, md: 48 }, // Smaller on mobile but still touch-friendly
                  transition: "all 0.2s ease",
                  "&.Mui-selected, &.Mui-selected:hover": {
                    bgcolor: "#2c5282",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#90cdf4",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    transform: "translateX(2px)",
                  },
                }}
              >
                {" "}
                {link.icon && (
                  <ListItemIcon
                    sx={{
                      color: "#b0b8c1",
                      minWidth: { xs: 32, sm: 36, md: 40 }, // Responsive icon spacing
                      "& svg": {
                        fontSize: { xs: 16, sm: 18, md: 20 }, // Smaller icons on mobile
                      },
                    }}
                  >
                    {link.icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontSize: { xs: 13, sm: 14, md: 15 }, // Smaller text on mobile
                    fontWeight: 500,
                    letterSpacing: 0.25,
                    noWrap: true, // Prevent text wrapping
                  }}
                />
              </ListItemButton>
            );
          }
          return null;
        })}
      </List>
    </Box>
  );
  if (isMobile || isTablet) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          "& .MuiDrawer-paper": {
            borderRight: "none",
            boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
            width: { xs: 260, sm: 280 }, // Responsive drawer width
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }
  // Desktop sidebar - always visible
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 1200,
        // Always visible on desktop (no transform)
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;