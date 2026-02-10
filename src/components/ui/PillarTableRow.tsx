import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Visibility, Edit, Delete, MoreVert } from "@mui/icons-material";
import { Pillar } from "@/types/pillar";
import PermissionGuard from "@/components/PermissionGuard";

interface PillarTableRowProps {
  pillar: Pillar;
  onEdit: (pillar: Pillar) => void;
  onDelete: (pillar: Pillar) => void;
  onView: (pillar: Pillar) => void;
}

const PillarTableRow: React.FC<PillarTableRowProps> = ({ 
  pillar, 
  onEdit, 
  onDelete,
  onView
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const primaryImage = pillar.profileImages.find(img => img.type === 'primary');
  const secondaryImage = pillar.profileImages.find(img => img.type === 'secondary');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleView = () => {
    onView(pillar);
    handleMenuClose();
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
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {/* Profile Images */}
      <TableCell>
        {primaryImage && (
            <Avatar 
              src={primaryImage.url} 
              alt={pillar.name}
              sx={{ width: 60, height: 60, borderRadius: 2 }}
            />
          )}
        {/* <AvatarGroup max={2}>
          {primaryImage && (
            <Avatar 
              src={primaryImage.url} 
              alt={pillar.name}
              sx={{ width: 60, height: 60 }}
            />
          )}
          {secondaryImage && (
            <Avatar 
              src={secondaryImage.url} 
              alt={pillar.name}
              sx={{ width: 40, height: 40 }}
            />
          )}
        </AvatarGroup> */}
      </TableCell>

      {/* Name & Designation */}
      <TableCell>
        <Typography variant="body2" >
          {pillar.name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {pillar.designation}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {pillar.experience}
        </Typography>
      </TableCell>

      {/* Projects */}
      <TableCell>
        <Typography variant="body2">
          {pillar.projects?.length || 0} project{pillar.projects?.length !== 1 ? 's' : ''}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* View Button - Always visible */}
          <IconButton
            size="small"
            onClick={handleView}
            color="primary"
            title="View Details"
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              },
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleEdit}
            color="primary"
            title="View Details"
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDelete}
            color="primary"
            title="View Details"
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>

        </Box>
      </TableCell>

    </TableRow>
  );
};

export default PillarTableRow;


