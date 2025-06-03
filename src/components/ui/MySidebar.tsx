import React from 'react';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// Extend SidebarLink type to allow onClick for label links
export type SidebarLink =
  | { kind: 'header'; title: string }
  | { kind: 'divider' }
  | { label: string; href: string; icon?: React.ReactNode; children?: SidebarLink[]; onClick?: () => void };

interface MySidebarProps {
  onClose: () => void;
  links?: SidebarLink[];
}

const MySidebar: React.FC<MySidebarProps> = ({ onClose, links = [] }) => {
  return (
    <nav aria-label="sidebar" style={{ width: 260, height: '100%', background: '#181C1F', color: '#fff', borderRight: '1px solid #23272A' }}>
      <List sx={{ width: 260, py: 2 }}>
        {links.map((link, idx) => {
          if ('kind' in link && link.kind === 'header') {
            return (
              <Typography key={link.title + idx} sx={{ px: 2, py: 1, fontSize: 13, color: '#b0b8c1', fontWeight: 600, textTransform: 'none', letterSpacing: 0.5 }}>
                {link.title}
              </Typography>
            );
          }
          if ('kind' in link && link.kind === 'divider') {
            return <Divider key={idx} sx={{ my: 1, bgcolor: '#23272A' }} />;
          }
          if (!('kind' in link)) {
            return (
              <ListItemButton
                key={link.href}
                onClick={() => {
                  if (typeof link.onClick === 'function') link.onClick();
                  onClose();
                }}
                sx={{
                  color: '#fff',
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected, &.Mui-selected:hover': {
                    bgcolor: '#23272A',
                    color: '#fff',
                  },
                  '&:hover': {
                    bgcolor: '#23272A',
                  },
                  height: 44,
                }}
              >
                {link.icon && <ListItemIcon sx={{ color: '#6EC1E4', minWidth: 36 }}>{link.icon}</ListItemIcon>}
                <ListItemText primary={link.label} sx={{ fontWeight: 500 }} />
              </ListItemButton>
            );
          }
          return null;
        })}
      </List>
    </nav>
  );
};

export default MySidebar;
