"use client";

import React from "react";
import { Grid } from "@mui/material";
import { Property } from '@/services/propertyService';
import ProjectOverview from "../../property-view/ProjectOverview";
import LocationCard from "../../property-view/LocationCard";
import QuickInfoCard from "../../property-view/QuickInfoCard";
import SubPropertiesViewer from "../../SubPropertiesViewer";
import { Box } from "@mui/system";

interface PropertyContentProps {
  property: Property;
  onViewSubProperty: (subProperty: Property) => void;
}

const PropertyContent: React.FC<PropertyContentProps> = ({
  property,
  onViewSubProperty,
}) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 8 }}>
        <ProjectOverview property={property} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <LocationCard property={property} />
        <QuickInfoCard property={property} />
      </Grid>

      {property.parentId === null && (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 4 }}>
            <SubPropertiesViewer 
              parentId={property._id!} 
              onViewSubProperty={onViewSubProperty}
            />
          </Box>
        </Grid>
      )}
    </>
  );
};

export default PropertyContent;