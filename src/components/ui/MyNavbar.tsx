import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import { useTheme, useMediaQuery } from "@mui/material";
import MyAvatar from "./MyAvatar";
import ProfileMenu from "./ProfileMenu";

interface MyNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MyNavbar: React.FC<MyNavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // More aggressive mobile breakpoint
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        px: { xs: 0.5, sm: 1, md: 2 }, // Reduced padding on small screens
        py: { xs: 0.25, sm: 0.5, md: 1 }, // Reduced vertical padding
        bgcolor: "#181C1F",
        height: { xs: 48, sm: 56, md: 64 }, // Smaller height on mobile
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden", // Prevent overflow
      }}
    >
      {" "}
      {/* Mobile menu button */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          mr: { xs: 0.5, sm: 1, md: 2 }, // Reduced margin on small screens
          display: { xs: "block", lg: "none" },
          p: { xs: 0.5, sm: 1, md: 1.5 }, // Smaller padding on mobile
          minWidth: { xs: 40, sm: 44 }, // Ensure minimum touch target
          minHeight: { xs: 40, sm: 44 },
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <MenuIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
      </IconButton>
      {/* Logo and brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.5, sm: 1, md: 2 }, // Reduced gap on small screens
          minWidth: 0, // Allow shrinking
          flex: 1, // Take available space
        }}
      >
        <MyAvatar
          src="/inrext.png"
          alt="Inrext"
          borderRadius="8px"
          sx={{
            width: { xs: 28, sm: 32, md: 40 }, // Smaller on mobile
            height: { xs: 28, sm: 32, md: 40 },
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#6EC1E4",
            letterSpacing: 0.5,
            fontSize: { xs: 14, sm: 16, md: 18 }, // Smaller font on mobile
            display: { xs: isSmallMobile ? "none" : "block", sm: "block" }, // Hide on very small screens
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Inrext
        </Typography>
      </Box>{" "}
      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Profile menu */}
      <ProfileMenu />
    </Box>
  );
};

export default MyNavbar;
