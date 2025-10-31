import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Home,
  CurrencyRupee,
} from "@mui/icons-material";
import { propertyService, type Property } from "@/services/propertyService";
import { toast } from "sonner";

interface SubPropertiesViewerProps {
  parentId: string;
  onViewSubProperty: (property: Property) => void;
}

const SubPropertiesViewer: React.FC<SubPropertiesViewerProps> = ({ parentId, onViewSubProperty }) => {
  const [subProperties, setSubProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubProperties();
  }, [parentId]);

  const loadSubProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getSubProperties(parentId);
      if (response.success) {
        setSubProperties(response.data as Property[]);
      }
    } catch (error) {
      console.error("Failed to load sub-properties:", error);
      toast.error("Failed to load sub-properties");
    } finally {
      setLoading(false);
    }
  };

  const getFirstImage = (property: Property) => {
    if (property.propertyImages && property.propertyImages.length > 0) {
      return property.propertyImages[0];
    }
    if (property.images && property.images.length > 0) {
      return property.images[0].url || property.images[0];
    }
    return null;
  };

  const renderPropertyImage = (property: Property) => {
    const imageSrc = getFirstImage(property);
    
    if (imageSrc) {
      const imageUrl = typeof imageSrc === 'string' ? imageSrc : imageSrc.url;
      return (
        <img 
          src={imageUrl} 
          alt={property.propertyName} 
          style={{ 
            width: '100%', 
            height: '130px', 
            objectFit: 'cover',
            borderRadius: '8px'
          }} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '120px', 
          backgroundColor: 'grey.200',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Home sx={{ color: 'grey.400' }} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={2}>
        <CircularProgress size={20} />
        <Typography variant="body2" sx={{ ml: 1 }}>Loading sub-properties...</Typography>
      </Box>
    );
  }

  if (subProperties.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="body1" color="text.secondary">
          No sub-properties found for this project
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add residential, commercial, or plot properties to this project
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {subProperties.map((subProperty) => (
          <Grid size={{ xs: 12 }} key={subProperty._id}>
            <Card variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 2 }}>
                    {renderPropertyImage(subProperty)}
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 10 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {subProperty.propertyName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {subProperty.price && (
                        <Chip 
                          label={`${subProperty.price}`} 
                          size="small" 
                          variant="outlined"
                          icon={<CurrencyRupee sx={{ fontSize: '14px' }} />}
                        />
                      )}
                      {subProperty.propertyType && (
                        <Chip 
                          label={`${subProperty.propertyType}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {subProperty.minSize && (
                        <Chip 
                          label={`${subProperty.minSize} - ${subProperty.maxSize} ${subProperty.sizeUnit}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {subProperty.bedrooms && subProperty.bedrooms > 0 && (
                        <Chip 
                          label={`${subProperty.bedrooms} Beds`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {subProperty.bathrooms && subProperty.bathrooms > 0 && (
                        <Chip 
                          label={`${subProperty.bathrooms} Baths`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      {subProperty.propertyDescription && (
                        <Typography variant="body2" color="text.secondary">
                          {subProperty.propertyDescription.split(' ').slice(0, 20).join(' ')}
                          {subProperty.propertyDescription.split(' ').length > 20 && '...'}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        color="primary.main" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => onViewSubProperty(subProperty)}
                      >
                        view more details
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SubPropertiesViewer;


