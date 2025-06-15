"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import { Box, Typography, Drawer, useMediaQuery } from "@mui/material";
import MySidebar from "../../components/ui/MySidebar";
import MyAvatar from "../../components/ui/MyAvatar";
import MyNavbar from "../../components/ui/MyNavbar";
import { usePermissions } from "../../contexts/PermissionsContext";
import PermissionGuard from "../../components/PermissionGuard";

// Lazy load heavy components for better performance
const Leads = lazy(() => import("./Leads"));
const Users = lazy(() => import("./Users"));
const Roles = lazy(() => import("./Roles"));

// Constants for better performance and reusability
const NAVBAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 260;
const MOBILE_BREAKPOINT = "(max-width: 600px)";

// SVG Icons as constants to avoid re-creation
const DashboardIcon = memo(() => (
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
));
DashboardIcon.displayName = "DashboardIcon";

const LeadsIcon = memo(() => (
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
));
LeadsIcon.displayName = "LeadsIcon";

const UsersIcon = memo(() => (
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
));
UsersIcon.displayName = "UsersIcon";

const RolesIcon = memo(() => (
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
));
RolesIcon.displayName = "RolesIcon";

// Loading component for Suspense
const ComponentLoader = memo(() => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    }}
  >
    <Typography>Loading...</Typography>
  </Box>
));
ComponentLoader.displayName = "ComponentLoader";

// Toolbar actions (memoized for performance)
export const DashboardToolbarActions = memo(() => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <MyAvatar src="/avatar.png" alt="User" />
  </Box>
));
DashboardToolbarActions.displayName = "DashboardToolbarActions";

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
  // Use optimized breakpoint
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, {
    noSsr: true, // This prevents SSR mismatch
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized sidebar links for better performance
  const allSidebarLinks = useMemo<SidebarLink[]>(
    () => [
      {
        label: "Dashboard",
        href: "dashboard",
        icon: <DashboardIcon />,
      },
      {
        label: "Leads",
        href: "leads",
        module: "lead",
        icon: <LeadsIcon />,
      },
      {
        label: "Users",
        href: "users",
        module: "employee",
        icon: <UsersIcon />,
      },
      { kind: "divider" },
      {
        label: "Roles",
        href: "roles",
        module: "role",
        icon: <RolesIcon />,
      },
    ],
    []
  );

  // Filter sidebar links based on permissions (memoized)
  const sidebarLinks = useMemo(() => {
    return allSidebarLinks.filter((link) => {
      if ("kind" in link) return true; // Always show headers and dividers
      if (!("module" in link)) return true; // Always show dashboard
      if (!link.module) return true; // Show links without module specified
      return hasReadAccess(link.module);
    });
  }, [allSidebarLinks, hasReadAccess]);

  // Memoized content rendering
  const content = useMemo(() => {
    if (selected === "leads") {
      return (
        <PermissionGuard module="lead" action="read" hideWhenNoAccess>
          <Suspense fallback={<ComponentLoader />}>
            <Leads />
          </Suspense>
        </PermissionGuard>
      );
    } else if (selected === "users") {
      return (
        <PermissionGuard module="employee" action="read" hideWhenNoAccess>
          <Suspense fallback={<ComponentLoader />}>
            <Users />
          </Suspense>
        </PermissionGuard>
      );
    } else if (selected === "roles") {
      return (
        <PermissionGuard module="role" action="read" hideWhenNoAccess>
          <Suspense fallback={<ComponentLoader />}>
            <Roles />
          </Suspense>
        </PermissionGuard>
      );
    } else {
      return (
        <Typography
          sx={{ mt: 2, ml: 2, fontWeight: 500, fontSize: 18, color: "#000" }}
        >
          Dashboard content will be displayed here
        </Typography>
      );
    }
  }, [selected]);

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
          pt: `${NAVBAR_HEIGHT}px`, // Account for navbar height
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
                  width: SIDEBAR_WIDTH,
                  bgcolor: "#fafcfd",
                  color: "#fff",
                  borderRight: "1px solid #23272A",
                  top: `${NAVBAR_HEIGHT}px`, // Start below fixed navbar
                  height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
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
                width: SIDEBAR_WIDTH,
                minWidth: SIDEBAR_WIDTH,
                flexShrink: 0,
                bgcolor: "#f8fafc",
                color: "#fff",
                boxShadow: 1,
                position: "fixed",
                left: 0,
                top: `${NAVBAR_HEIGHT}px`, // Start below fixed navbar
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
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
            marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`, // Account for fixed sidebar width
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
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
