// components/PropertyCard.tsx
import React, { useState, useEffect, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home,
  CurrencyRupee,
  Public,
  Star,
  Business,
  Landscape,
  Image as ImageIcon,
  BrokenImage,
} from "@mui/icons-material";
import { Property } from "@/services/propertyService";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, getPermissions } = useAuth();

  // Check permissions for property module
  const permissions = getPermissions("property");
  const canEditProperty = permissions.hasWriteAccess;
  const canDeleteProperty = permissions.hasDeleteAccess;

  // Use ref to track if component is mounted
  const isMounted = useRef(true);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize states with proper defaults
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // Start with false
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false); // Track if image has loaded

  // Get primary image URL - Function outside useEffect for reusability
  const getPrimaryImageUrl = (projectImages: any[]): string | null => {
    // Check if images exist
    if (!projectImages || !Array.isArray(projectImages) || projectImages.length === 0) {
      return null;
    }

    // Find primary image or use first image
    const imageObj =
      projectImages.find((img) => {
        if (typeof img === "object" && img !== null) {
          return img.isPrimary === true;
        }
        return false;
      }) || projectImages[0];

    if (!imageObj) {
      return null;
    }

    // Extract URL from object or use string directly
    let imageUrl: string | null = null;

    if (typeof imageObj === "string") {
      imageUrl = imageObj;
    } else if (imageObj && typeof imageObj === "object") {
      // Check multiple possible URL fields
      imageUrl =
        imageObj.url ||
        imageObj.imageUrl ||
        imageObj.path ||
        imageObj.src ||
        imageObj.location ||
        null;
    }

    if (!imageUrl) {
      return null;
    }

    // Handle base64 images - allow them
    if (imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    // Handle relative URLs - convert to absolute
    if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("uploads/")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    // Handle URLs without protocol
    if (
      !imageUrl.startsWith("http") &&
      !imageUrl.startsWith("data:") &&
      !imageUrl.startsWith("/")
    ) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      return `${baseUrl}/${imageUrl}`;
    }

    return imageUrl;
  };

  // Set image URL immediately when component mounts or project changes
  useEffect(() => {
    isMounted.current = true;

    const imageUrl = getPrimaryImageUrl(project.images || []);

    if (isMounted.current) {
      setPrimaryImageUrl(imageUrl);
      setImageLoading(!!imageUrl); // Only show loading if we have a URL
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(0);
    }

    return () => {
      isMounted.current = false;
    };
  }, [project._id]); // Only depend on project ID to avoid unnecessary re-renders

  // Separate effect to handle image changes
  useEffect(() => {
    const imageUrl = getPrimaryImageUrl(project.images || []);
    
    // Only update if URL actually changed
    if (imageUrl !== primaryImageUrl) {
      setPrimaryImageUrl(imageUrl);
      setImageLoading(!!imageUrl);
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(0);
    }
  }, [project.images]);

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

  // Get property type icon
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "residential":
        return <Home sx={{ fontSize: 16 }} />;
      case "commercial":
        return <Business sx={{ fontSize: 16 }} />;
      case "plot":
        return <Landscape sx={{ fontSize: 16 }} />;
      case "project":
        return <Home sx={{ fontSize: 16 }} />;
      default:
        return <Home sx={{ fontSize: 16 }} />;
    }
  };

  // Get property type color
  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "primary";
      case "commercial":
        return "warning";
      case "plot":
        return "info";
      case "project":
        return "secondary";
      default:
        return "default";
    }
  };

  // Handle image load
  const handleImageLoad = () => {
    if (isMounted.current) {
      setImageLoading(false);
      setImageError(false);
      setImageLoaded(true);
    }
  };

  // Handle image error with retry logic
  const handleImageError = () => {
    if (!isMounted.current) return;

    // Retry once with a slight delay
    if (retryCount < 1 && primaryImageUrl) {
      setTimeout(() => {
        if (isMounted.current) {
          setRetryCount((prev) => prev + 1);
          setImageLoading(true);
          setImageError(false);

          // Force re-render by adding timestamp to URL if it's not base64
          if (!primaryImageUrl.startsWith("data:")) {
            const separator = primaryImageUrl.includes("?") ? "&" : "?";
            setPrimaryImageUrl(`${primaryImageUrl}${separator}t=${Date.now()}`);
          }
        }
      }, 1000);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  // Determine if we should show the image
  const shouldShowImage = primaryImageUrl && !imageError;
  const shouldShowLoading = imageLoading && shouldShowImage && !imageLoaded;
  const shouldShowError = (!primaryImageUrl || imageError) && !imageLoading;

  return (
    <Paper
      sx={{
        mb: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "15px",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
        },
        position: "relative",
      }}
    >
      {/* Property Image Section */}
      <Box
        sx={{
          position: "relative",
          height: "15rem",
          overflow: "hidden",
          borderRadius: "15px 15px 0 0",
          backgroundColor: "#f5f5f5",
        }}
      >
        {/* Image container */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Loading state */}
          {shouldShowLoading && (
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                zIndex: 2,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}

          {/* Actual image */}
          {shouldShowImage && (
            <Box
              ref={imageRef}
              component="img"
              src={primaryImageUrl}
              alt={project.projectName}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
              }}
            />
          )}

          {/* Error or no image state */}
          {shouldShowError && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                backgroundColor: "#e0e0e0",
                color: "#666",
              }}
            >
              {imageError ? (
                <>
                  <BrokenImage sx={{ fontSize: 48, mb: 2, color: "#999" }} />
                  <Typography variant="body1" color="text.secondary">
                    Image failed to load
                  </Typography>
                </>
              ) : (
                <>
                  <ImageIcon sx={{ fontSize: 48, mb: 2, color: "#999" }} />
                  <Typography variant="body1" color="text.secondary">
                    No image available
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Dark overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: shouldShowImage
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.3)",
            zIndex: 1,
          }}
        />

        {/* Action Buttons - Top right */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            gap: 0.8,
            zIndex: 3,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onView(project);
            }}
            sx={{
              backgroundColor: "white",
              borderRadius: "100%",
              "&:hover": {
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>

          {/* Edit button - only with write permission */}
          {canEditProperty && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: "100%",
                "&:hover": {
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}

          {/* Delete button - only with delete permission */}
          {canDeleteProperty && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id!);
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: "100%",
                "&:hover": {
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Property Info Overlay - Centered */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2,
            color: "white",
            textAlign: "center",
            padding: 2,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            gutterBottom
            sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
          >
            {project.projectName}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 1,
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            by {project.builderName}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {project.price || "Contact for Price"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Admin Controls */}
      {showAdminControls && canEditProperty && (
        <CardContent sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip
                title={
                  project.isPublic
                    ? "Visible on public website"
                    : "Hidden from public website"
                }
              >
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <Tooltip
                title={
                  project.isFeatured ? "Featured on website" : "Not featured"
                }
              >
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
