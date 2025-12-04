// components/PropertyCard.tsx
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
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home,
  CurrencyRupee,
  Public,
  Star,
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
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  showAdminControls?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  project,
  onEdit,
  onView,
  onDelete,
  onViewSubProperty,
  onEditSubProperty,
  onDeleteSubProperty,
  onTogglePublic,
  onToggleFeatured,
  showAdminControls = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [subProperties, setSubProperties] = useState<Property[]>([]);
  const [loadingSubProperties, setLoadingSubProperties] = useState(false);

  const primaryImage = project.images?.find(img => img.isPrimary) || project.images?.[0];

  const handleTogglePublic = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (onTogglePublic && project._id) {
      onTogglePublic(project._id, event.target.checked);
    }
  };

  const handleToggleFeatured = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (onToggleFeatured && project._id) {
      onToggleFeatured(project._id, event.target.checked);
    }
  };

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
        },
        position: 'relative'
      }}
    >
      {/* Featured */}
      {project.isFeatured && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 2,
            backgroundColor: 'gold',
            color: 'black',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Star sx={{ fontSize: '1rem' }} />
          Featured
        </Box>
      )}

      {/* Public */}
      {project.isPublic && (
        <Box
          sx={{
            position: 'absolute',
            top: project.isFeatured ? 50 : 16,
            left: 16,
            zIndex: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Public sx={{ fontSize: '1rem' }} />
          Public
        </Box>
      )}

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

      {/* Admin Controls */}
      {showAdminControls && (
        <CardContent sx={{ borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip title={project.isPublic ? "Visible on public website" : "Hidden from public website"}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={project.isPublic || false}
                      onChange={handleTogglePublic}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public fontSize="small" />
                      <Typography variant="body2">
                        {project.isPublic ? "Public" : "Private"}
                      </Typography>
                    </Box>
                  }
                />
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip title={project.isFeatured ? "Featured on website" : "Not featured"}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={project.isFeatured || false}
                      onChange={handleToggleFeatured}
                      color="secondary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star fontSize="small" />
                      <Typography variant="body2">
                        {project.isFeatured ? "Featured" : "Standard"}
                      </Typography>
                    </Box>
                  }
                />
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      )}
    </Paper>
  );
};

export default PropertyCard;
