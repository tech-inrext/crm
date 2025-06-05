import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import MyAvatar from './MyAvatar';
import ProfileMenu from './ProfileMenu';

interface MyNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MyNavbar: React.FC<MyNavbarProps> = ({ sidebarOpen, setSidebarOpen }) => (
  <Box
    sx={{
      position: 'relative',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      px: { xs: 2, sm: 2 },
      py: 1,
      bgcolor: '#181C1F',
      height: 56,
      boxShadow: 1,
      flexDirection: 'row',
      gap: 0,
    }}
  >
    <IconButton
      color="inherit"
      edge="start"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
    >
      <MenuIcon />
    </IconButton>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <MyAvatar src="/inrext.png" alt="Toolpad" borderRadius="8px" />
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: '#6EC1E4', letterSpacing: 0.5, fontSize: 20 }}
      >
        Inrext
      </Typography>
    </Box>
    <Box sx={{ flexGrow: 1 }} />
    {/* ProfileMenu dropdown */}
      <ProfileMenu />
  </Box>
);

export default MyNavbar;
