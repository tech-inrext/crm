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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 0.5, sm: 1 },
        bgcolor: "#181C1F",
        height: { xs: 56, md: 64 },
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Mobile menu button */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          mr: { xs: 1, sm: 2 },
          display: { xs: "block", lg: "none" },
          p: { xs: 1, sm: 1.5 },
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
      </IconButton>
      {/* Logo and brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          minWidth: 0, // Allow shrinking
        }}
      >
        <MyAvatar
          src="/inrext.png"
          alt="Inrext"
          borderRadius="8px"
          sx={{
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#6EC1E4",
            letterSpacing: 0.5,
            fontSize: { xs: 16, sm: 18, md: 20 },
            display: { xs: isMobile ? "none" : "block", sm: "block" },
            whiteSpace: "nowrap",
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
