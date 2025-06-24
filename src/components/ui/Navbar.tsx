import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import { useTheme, useMediaQuery } from "@mui/material";
import AvatarComponent from "./Avatar";
import ProfileMenu from "./ProfileMenu";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
        px: { xs: 0.5, sm: 1, md: 2 },
        py: { xs: 0.25, sm: 0.5, md: 1 },
        bgcolor: "#181C1F",
        height: { xs: 48, sm: 56, md: 64 },
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          mr: { xs: 0.5, sm: 1, md: 2 },
          display: { xs: "block", lg: "none" },
          p: { xs: 0.5, sm: 1, md: 1.5 },
          minWidth: { xs: 40, sm: 44 },
          minHeight: { xs: 40, sm: 44 },
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <MenuIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.5, sm: 1, md: 2 },
          minWidth: 0,
          flex: 1,
        }}
      >
        <AvatarComponent
          src="/inrext.png"
          alt="Inrext"
          borderRadius="8px"
          sx={{
            width: { xs: 28, sm: 32, md: 40 },
            height: { xs: 28, sm: 32, md: 40 },
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 16, sm: 18, md: 22 },
            color: "#fff",
            letterSpacing: 1,
            ml: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Inrext
        </Typography>
      </Box>
      <ProfileMenu />
    </Box>
  );
};

export default Navbar;
