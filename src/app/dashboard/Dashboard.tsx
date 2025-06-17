"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Container,
} from "@mui/material";
import Image from "next/image";
import MySidebar from "../../components/ui/MySidebar";
import MyNavbar from "../../components/ui/MyNavbar";
import { usePermissions } from "../../contexts/PermissionsContext";
import PermissionGuard from "../../components/PermissionGuard";

// Lazy load heavy components for better performance
const Leads = lazy(() => import("./Leads"));
const Users = lazy(() => import("./Users"));
const Roles = lazy(() => import("./Roles"));

// Loading component for Suspense
const LoadingFallback = memo(() => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
));
LoadingFallback.displayName = "LoadingFallback";

// Reusable Icon Component for better maintainability
const AppIcon = memo(
  ({ src, alt, size = 24 }: { src: string; alt: string; size?: number }) => (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        display: "block",
      }}
      priority={false}
      unoptimized
    />
  )
);
AppIcon.displayName = "AppIcon";

// Icon instances
const DashboardIcon = memo(() => (
  <AppIcon src="/dasboard.png" alt="Dashboard" />
));
const LeadsIcon = memo(() => <AppIcon src="/leads.png" alt="Leads" />);
const UsersIcon = memo(() => <AppIcon src="/users.png" alt="Users" />);
const RolesIcon = memo(() => <AppIcon src="/roles.png" alt="Roles" />);

DashboardIcon.displayName = "DashboardIcon";
LeadsIcon.displayName = "LeadsIcon";
UsersIcon.displayName = "UsersIcon";
RolesIcon.displayName = "RolesIcon";

// Types for better TypeScript support
type SidebarLink =
  | { kind: "header"; title: string }
  | { kind: "divider" }
  | {
      label: string;
      href: string;
      module?: string;
      icon?: React.ReactNode;
      onClick?: () => void;
    };

// Main dashboard layout component
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState("dashboard");
  const { hasReadAccess, loading: permissionsLoading } = usePermissions();

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Sidebar should always be open on desktop, controllable on mobile
  const sidebarIsOpen = isMobile ? sidebarOpen : true;

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
        onClick: () => setSelected("dashboard"),
      },
      {
        label: "Leads",
        href: "leads",
        module: "lead",
        icon: <LeadsIcon />,
        onClick: () => setSelected("leads"),
      },
      {
        label: "Users",
        href: "users",
        module: "employee",
        icon: <UsersIcon />,
        onClick: () => setSelected("users"),
      },
      { kind: "divider" },
      {
        label: "Roles",
        href: "roles",
        module: "role",
        icon: <RolesIcon />,
        onClick: () => setSelected("roles"),
      },
    ],
    []
  );

  // Filter sidebar links based on user permissions
  const sidebarLinks = useMemo(() => {
    if (permissionsLoading) return [];

    return allSidebarLinks.filter((link) => {
      if ("kind" in link) return true; // Always show headers and dividers
      if (!link.module) return true; // Always show links without module requirement
      return hasReadAccess(link.module); // Show only if user has read access
    });
  }, [allSidebarLinks, hasReadAccess, permissionsLoading]);

  // Render content based on selected page
  const renderContent = () => {
    switch (selected) {
      case "leads":
        return (
          <PermissionGuard module="lead" action="read">
            <Leads />
          </PermissionGuard>
        );
      case "users":
        return (
          <PermissionGuard module="employee" action="read">
            <Users />
          </PermissionGuard>
        );
      case "roles":
        return (
          <PermissionGuard module="role" action="read">
            <Roles />
          </PermissionGuard>
        );
      default:
        return (
          <Box
            sx={{
              p: { xs: 3, sm: 4, md: 5 }, // Increased padding
              textAlign: "center",
              mt: { xs: 2, md: 4 }, // Added top margin
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" }, // Slightly larger
                fontWeight: 700,
                color: "primary.main",
                mb: { xs: 3, md: 4 }, // Increased bottom margin
              }}
            >
              Welcome to Dashboard
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem" }, // Slightly larger
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6, // Better line height
              }}
            >
              Select an option from the sidebar to get started.
            </Typography>
          </Box>
        );
    }
  };

  // Show loading state during mount to prevent hydration mismatch
  if (!mounted) {
    return <LoadingFallback />;
  }

  // Mobile-first responsive layout
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
      }}
    >
      {/* Fixed Navbar */}
      <MyNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />{" "}
      {/* Sidebar - responsive */}
      <MySidebar
        open={sidebarIsOpen}
        onClose={() => setSidebarOpen(false)}
        links={sidebarLinks}
      />{" "}
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, lg: 3 }, // More top padding - account for navbar on mobile + extra space on desktop
          pb: 3, // Bottom padding for better spacing
          pl: { xs: 0, lg: "260px" }, // Always account for sidebar on desktop
          transition: "padding-left 0.3s ease",
          minHeight: "100vh",
          width: { xs: "100%", lg: "calc(100% - 260px)" }, // Always account for sidebar on desktop
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            py: { xs: 2, sm: 3, md: 4 }, // Increased vertical padding
            px: { xs: 2, sm: 3, md: 4 }, // Increased horizontal padding
            minHeight: "calc(100vh - 64px)", // Adjusted for new padding
          }}
        >
          <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
