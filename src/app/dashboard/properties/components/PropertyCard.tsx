import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home,
  CurrencyRupee,
} from "@mui/icons-material";
import { Property } from "@/services/propertyService";

interface PropertyCardProps {
  project: Property;
  onEdit: (property: Property) => void;
  onView: (property: Property) => void;
  onDelete: (id: string) => void;
  onViewSubProperty: (property: Property) => void;
  onEditSubProperty: (property: Property) => void;
  onDeleteSubProperty: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  project,
  onEdit,
  onView,
  onDelete,
  onViewSubProperty,
  onEditSubProperty,
  onDeleteSubProperty,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [subProperties, setSubProperties] = useState<Property[]>([]);
  const [loadingSubProperties, setLoadingSubProperties] = useState(false);

  const primaryImage = project.images?.find(img => img.isPrimary) || project.images?.[0];

  return (
    <Paper 
      sx={{ 
        mb: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: expanded ? 'primary.main' : 'divider',
        borderRadius: '15px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
        }
      }}
    >
      <Box 
        sx={{ 
          p: 2,
          height: "15rem",
          transition: "transform 0.2s",
          backgroundImage: primaryImage ? `url(${primaryImage.url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '15px 15px 0 0'
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" justifyContent="flex-end" alignItems="flex-start">
          <Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onView(project);
              }} 
              sx={{ color: 'white' }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }} 
              sx={{ color: 'white' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id!);
              }} 
              sx={{ color: 'white' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box position="absolute" zIndex={1} sx={{ 
          color: 'white', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          bottom: '10px', 
          left: 0, 
          right: 0 
        }}>
          <Typography variant="h5" fontWeight={600}>{project.projectName}</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} gutterBottom>
            by {project.builderName}
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {project.price || 'Contact for Price'}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
            <Chip 
              label={`${project.subPropertyCount || 0} Properties`}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                color: 'black', 
                fontWeight: 600 
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PropertyCard;

