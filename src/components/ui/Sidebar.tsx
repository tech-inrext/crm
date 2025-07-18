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
import { useRouter, usePathname } from "next/navigation";
// Extend SidebarLink type to allow onClick for label links

const handleClick = () => {};
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

const SidebarContent = ({ links, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // More aggressive mobile breakpoint
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const handleClick = (e, link) => {
    e.preventDefault();
    console.log("link", link.href);
    router.push(link.href);

    if (isMobile || isTablet) {
      onClose(); // Auto-close on mobile and tablet
    }
  };

  return (
    <Box
      sx={{
        width: { xs: 260, sm: 280, md: 300, lg: 260 }, // Better responsive width
        height: "100%",
        background: "#fff",
        color: "#fff",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <List
        sx={{
          py: { xs: 0.5, sm: 1, md: 2 }, // Reduced padding on mobile
          px: { xs: 0.5, sm: 1 }, // Reduced horizontal padding
          mt: { xs: "48px", sm: "56px", md: "16px" }, // Match navbar height only for mobile/tablet, added margin for desktop
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {links.map((link, idx) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <ListItemButton
              key={link.href}
              selected={isActive}
              onClick={(e) => handleClick(e, link)}
              sx={{
                color: "#000",
                borderRadius: { xs: 1, sm: 2 },
                mx: { xs: 0.25, sm: 0.5, md: 1 }, // Reduced margin on mobile
                mb: { xs: 0.25, sm: 0.5 }, // Reduced bottom margin
                py: { xs: 0.75, sm: 1, md: 1.5 }, // Better responsive padding
                px: { xs: 0.75, sm: 1, md: 2 }, // Responsive horizontal padding
                minHeight: { xs: 36, sm: 40, md: 48 }, // Smaller on mobile but still touch-friendly
                transition: "all 0.2s ease",
                "&.Mui-selected, &.Mui-selected:hover": {
                  bgcolor: "#0076FF",
                  color: "#fff",
                  "& .MuiListItemIcon-root": {
                    color: "#90cdf4",
                  },
                },
                "&:hover": {
                  bgcolor: "#0076FF",
                  color: "#fff",
                  transform: "translateX(2px)",
                },
              }}
            >
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
        })}
      </List>
    </Box>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, links = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // More aggressive mobile breakpoint
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  return (
    <>
      {isMobile || isTablet ? (
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
          <SidebarContent links={links} onClose={onClose} />
        </Drawer>
      ) : (
        <Box
          sx={{
            position: "fixed",
            top: 50,
            left: 0,
            height: "100vh",
            zIndex: 1200,
            // Always visible on desktop (no transform)
          }}
        >
          <SidebarContent links={links} onClose={onClose} />
        </Box>
      )}
    </>
  );
};

export default Sidebar;
