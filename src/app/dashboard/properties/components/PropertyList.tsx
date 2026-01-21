// app/dashboard/properties/components/PropertyList.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import { Property } from "@/services/propertyService";
import PropertyCard from "./PropertyCard";

interface PropertyListProps {
  properties: Property[];
  currentPage: number;
  propertiesPerPage: number;
  onEdit: (property: Property) => void;
  onView: (property: Property) => void;
  onDelete: (id: string, propertyName?: string) => void;
  onViewSubProperty: (property: Property) => void;
  onEditSubProperty: (property: Property) => void;
  onDeleteSubProperty: (id: string, subPropertyName?: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  currentPage,
  propertiesPerPage,
  onEdit,
  onView,
  onDelete,
  onViewSubProperty,
  onEditSubProperty,
  onDeleteSubProperty,
  onTogglePublic,
  onToggleFeatured,
}) => {
  const getPaginatedProperties = () => {
    if (properties.length <= propertiesPerPage) {
      return properties;
    }
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    return properties.slice(startIndex, endIndex);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(auto-fill, minmax(320px, 1fr))",
          md: "repeat(auto-fill, minmax(340px, 1fr))",
          lg: "repeat(auto-fill, minmax(360px, 1fr))",
        },
        gap: 3,
        mb: 4,
      }}
    >
      {getPaginatedProperties().map((project) => (
        <PropertyCard
          key={project._id}
          project={project}
          onEdit={onEdit}
          onView={onView}
          onDelete={(id) => onDelete(id, project.projectName)}
          onViewSubProperty={onViewSubProperty}
          onEditSubProperty={onEditSubProperty}
          onDeleteSubProperty={(id, subPropertyName) =>
            onDelete(id, subPropertyName)
          }
          onTogglePublic={onTogglePublic}
          onToggleFeatured={onToggleFeatured}
          showAdminControls={true}
        />
      ))}
    </Box>
  );
};

export default PropertyList;