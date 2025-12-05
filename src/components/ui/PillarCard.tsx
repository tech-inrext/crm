import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVert, Edit, Delete } from '@mui/icons-material';
import { Pillar } from '@/types/pillar';
import PermissionGuard from '@/components/PermissionGuard';

interface PillarCardProps {
  pillar: Pillar;
  onEdit: (pillar: Pillar) => void;
  onDelete: (pillar: Pillar) => void;
  onClick?: (pillar: Pillar) => void;
}

const PillarCard: React.FC<PillarCardProps> = ({ 
  pillar, 
  onEdit, 
  onDelete, 
  onClick 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const primaryImage = pillar.profileImages.find(img => img.type === 'primary');
  const secondaryImage = pillar.profileImages.find(img => img.type === 'secondary');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(pillar);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(pillar);
    handleMenuClose();
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: { [key: string]: string } = {
      "the-visionaries": "The Visionaries",
      "the-strategic-force": "The Strategic Force",
      "growth-navigators": "Growth Navigators",
      "the-powerhouse-team": "The Powerhouse Team"
    };
    return categoryLabels[category] || category;
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onClick?.(pillar)}
    >
      {/* Profile Images */}
      <Box sx={{ position: 'relative', height: 200 }}>
        {primaryImage && (
          <CardMedia
            component="img"
            height="200"
            image={primaryImage.url}
            alt={pillar.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        
        {/* Secondary image as small overlay */}
        {secondaryImage && (
          <Avatar
            src={secondaryImage.url}
            sx={{
              position: 'absolute',
              bottom: -20,
              right: 16,
              width: 80,
              height: 80,
              border: '4px solid white',
              boxShadow: 2,
            }}
          />
        )}

        {/* Action Menu */}
        <PermissionGuard module="pillar" action="write" fallback={null}>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': {
                backgroundColor: 'white',
              },
            }}
          >
            <MoreVert />
          </IconButton>
        </PermissionGuard>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
        {/* Category */}
        <Chip 
          label={getCategoryLabel(pillar.category)} 
          color="primary" 
          size="small" 
          sx={{ mb: 1 }}
        />

        {/* Name and Designation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
            {pillar.name}
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" color="primary" gutterBottom>
          {pillar.designation}
        </Typography>

        {/* About (truncated) */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {pillar.about}
        </Typography>

        {/* Experience */}
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontStyle: 'italic',
            color: 'text.secondary',
          }}
        >
          {pillar.experience}
        </Typography>

        {/* Expertise */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Expertise:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {pillar.expertise.slice(0, 3).map((exp, index) => (
              <Chip
                key={index}
                label={exp}
                size="small"
                variant="outlined"
              />
            ))}
            {pillar.expertise.length > 3 && (
              <Chip
                label={`+${pillar.expertise.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Skills */}
        {pillar.skills && pillar.skills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {pillar.skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
              {pillar.skills.length > 3 && (
                <Chip
                  label={`+${pillar.skills.length - 3}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Projects */}
        {pillar.projects && pillar.projects.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Projects:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {pillar.projects.length} project{pillar.projects.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <PermissionGuard module="pillar" action="write" fallback={null}>
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit Pillar
          </MenuItem>
        </PermissionGuard>
        <PermissionGuard module="pillar" action="delete" fallback={null}>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Pillar
          </MenuItem>
        </PermissionGuard>
      </Menu>
    </Card>
  );
};

export default PillarCard;



