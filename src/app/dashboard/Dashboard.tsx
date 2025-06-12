"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import MySidebar from "../../components/ui/MySidebar";
import MyAvatar from "../../components/ui/MyAvatar";
import MyNavbar from "../../components/ui/MyNavbar";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import Leads from "./Leads";
import Users from "./Users";
import Roles from "./Roles";
import { usePermissions } from "../../contexts/PermissionsContext";
import PermissionGuard from "../../components/PermissionGuard";

// Toolbar actions (placeholder for user/account)
export const DashboardToolbarActions: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <MyAvatar src="/avatar.png" alt="User" />
  </Box>
);

// Update SidebarLink type to support headers and dividers
export type SidebarLink =
  | { kind: "header"; title: string }
  | { kind: "divider" }
  | {
      label: string;
      href: string;
      module?: string;
      icon?: React.ReactNode;
      children?: SidebarLink[];
    };

// Main dashboard layout (branding prop, sidebarLinks, slots)
const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState("dashboard");
  const { hasReadAccess, loading: permissionsLoading } = usePermissions();

  // Use a more specific breakpoint to avoid hydration issues
  const isMobile = useMediaQuery("(max-width: 600px)", {
    noSsr: true, // This prevents SSR mismatch
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);
  // Show loading state without complex styling to avoid hydration errors
  if (!mounted || permissionsLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#181C1F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ color: "white" }}>Loading...</Typography>
      </Box>
    );
  }

  // Sidebar navigation structure with permission-based filtering
  const allSidebarLinks: SidebarLink[] = [
    {
      label: "Dashboard",
      href: "dashboard",
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      label: "Leads",
      href: "leads",
      module: "lead",
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      label: "Users",
      href: "users",
      module: "employee",
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15V6.5A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5V15" />
          <path d="M21 15v2.5A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5V15" />
          <path d="M7 10h10" />
          <path d="M7 14h5" />
        </svg>
      ),
    },
    { kind: "divider" },
    {
      label: "Roles",
      href: "roles",
      module: "role",
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 7h10v10H7z" />
        </svg>
      ),
    },
  ];
  // Filter sidebar links based on permissions
  const sidebarLinks = allSidebarLinks.filter((link) => {
    if ("kind" in link) return true; // Always show headers and dividers
    if (!("module" in link)) return true; // Always show dashboard
    if (!link.module) return true; // Show links without module specified
    return hasReadAccess(link.module);
  });
  let content;
  if (selected === "leads") {
    content = (
      <PermissionGuard module="lead" action="read" hideWhenNoAccess>
        <Leads />
      </PermissionGuard>
    );
  } else if (selected === "users") {
    content = (
      <PermissionGuard module="employee" action="read" hideWhenNoAccess>
        <Users />
      </PermissionGuard>
    );
  } else if (selected === "roles") {
    content = (
      <PermissionGuard module="role" action="read" hideWhenNoAccess>
        <Roles />
      </PermissionGuard>
    );
  } else {
    content = (
      <Typography
        sx={{ mt: 2, ml: 2, fontWeight: 500, fontSize: 18, color: "#000" }}
      >
        Dashboard content will be displayed here
      </Typography>
    );
  }
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Header/Navbar - Fixed at top */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <MyNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </Box>{" "}
      {/* Main layout container with top padding for fixed navbar */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          pt: "56px", // Account for navbar height (56px from MyNavbar)
          minHeight: "100vh",
        }}
      >
        {/* Only render sidebar/drawer after mount to avoid hydration errors */}
        {mounted &&
          (isMobile ? (
            <Drawer
              variant="temporary"
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                zIndex: 1300,
                "& .MuiDrawer-paper": {
                  width: 260,
                  bgcolor: "#fafcfd",
                  color: "#fff",
                  borderRight: "1px solid #23272A",
                  top: "56px", // Start below fixed navbar
                  height: "calc(100vh - 56px)",
                  overflow: "auto",
                },
              }}
            >
              <MySidebar
                onClose={() => setSidebarOpen(false)}
                links={sidebarLinks.map((link) =>
                  "label" in link
                    ? { ...link, onClick: () => setSelected(link.href) }
                    : link
                )}
              />
            </Drawer>
          ) : (
            <Box
              sx={{
                width: 260,
                minWidth: 260,
                flexShrink: 0,
                bgcolor: "#f8fafc",
                color: "#fff",
                boxShadow: 1,
                position: "fixed",
                left: 0,
                top: "56px", // Start below fixed navbar
                height: "calc(100vh - 56px)",
                zIndex: 1100,
                borderRight: "1px solid #23272A",
                overflow: "auto",
              }}
            >
              <MySidebar
                onClose={() => setSidebarOpen(false)}
                links={sidebarLinks.map((link) =>
                  "label" in link
                    ? { ...link, onClick: () => setSelected(link.href) }
                    : link
                )}
              />
            </Box>
          ))}

        {/* Main content with proper spacing for fixed sidebar */}
        <Box
          component="main"
          sx={{
            flex: 1,
            marginLeft: isMobile ? 0 : "260px", // Account for fixed sidebar width
            minHeight: "calc(100vh - 56px)",
            bgcolor: "#f2f5f7",
            color: "#fff",
            overflow: "auto",
            position: "relative",
          }}
        >
          {/* Content wrapper with padding */}
          <Box
            sx={{
              p: 3,
              minHeight: "100%",
              overflow: "visible",
            }}
          >
            {content}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
