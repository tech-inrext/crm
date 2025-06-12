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
      icon?: React.ReactNode;
      children?: SidebarLink[];
    };

// Main dashboard layout (branding prop, sidebarLinks, slots)
const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState("dashboard");

  // Use a more specific breakpoint to avoid hydration issues
  const isMobile = useMediaQuery("(max-width: 600px)", {
    noSsr: true, // This prevents SSR mismatch
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state without complex styling to avoid hydration errors
  if (!mounted) {
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

  // Sidebar navigation structure matching the image
  const sidebarLinks: SidebarLink[] = [
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

  let content;
  if (selected === "leads") {
    content = <Leads />;
  } else if (selected === "users") {
    content = <Users />;
  } else if (selected === "roles") {
    content = <Roles />;
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
      }}
    >
      {/* Header/Navbar */}
      <MyNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Only render sidebar/drawer after mount to avoid hydration errors */}
        {mounted &&
          (isMobile ? (
            <Drawer
              variant="temporary"
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                "& .MuiDrawer-paper": {
                  width: 220,
                  bgcolor: "#fafcfd",
                  color: "#fff",
                  borderRight: "1px solid #23272A",
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
                height: "calc(100vh - 56px)",
                display: "block",
                position: "relative",
                zIndex: 1000,
                borderRight: "1px solid #23272A",
                overflow: "hidden",
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
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            overflow: "auto",
            minHeight: 0,
            bgcolor: "#f2f5f7",
            color: "#fff",
          }}
        >
          {content}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
