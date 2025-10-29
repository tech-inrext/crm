import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  alpha,
} from "@mui/material";
import {
  ExpandLess,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Employee } from "@/types/team-hierarchy";
import { HIERARCHY_COLORS } from "@/constants/team-hierarchy";
import { getNodeColor } from "@/utils/hierarchy.utils";

interface HierarchyNodeProps {
  node: Employee;
  depth: number;
  isOpen: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  renderChildren: (node: Employee, depth: number) => React.ReactNode;
}

export const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  node,
  depth,
  isOpen,
  isSelected,
  onToggle,
  onSelect,
  renderChildren,
}) => {
  const hasChildren = (node.children || []).length > 0;
  const nodeColor = getNodeColor(depth, HIERARCHY_COLORS);

  return (
    <Box sx={{ mb: 0.5 }}>
      <Card
        variant="outlined"
        sx={{
          borderLeft: `4px solid ${nodeColor}`,
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          bgcolor: isSelected ? alpha(nodeColor, 0.1) : "transparent",
          "&:hover": {
            bgcolor: alpha(nodeColor, 0.05),
            transform: "translateX(4px)",
            boxShadow: 1,
          },
        }}
        onClick={() => onSelect(node._id)}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {hasChildren ? (
              <Tooltip title={isOpen ? "Collapse" : "Expand"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(node._id);
                  }}
                  sx={{
                    bgcolor: alpha(nodeColor, 0.1),
                    "&:hover": { bgcolor: alpha(nodeColor, 0.2) },
                  }}
                >
                  {isOpen ? <ExpandLess /> : <ChevronRightIcon />}
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={{ width: 32 }} />
            )}

            <Badge
              badgeContent={hasChildren ? node.children?.length : 0}
              color="primary"
              invisible={!hasChildren}
            >
              <Avatar
                sx={{
                  bgcolor: nodeColor,
                  width: 40,
                  height: 40,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {node.name ? node.name.charAt(0).toUpperCase() : "?"}
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {node.name || "Unknown"}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 0.5, flexWrap: "wrap" }}
              >
                {node.designation && (
                  <Chip
                    icon={<WorkIcon />}
                    label={node.designation}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 11, height: 20 }}
                  />
                )}
                {node.branch && (
                  <Chip
                    icon={<LocationOnIcon />}
                    label={node.branch}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 11, height: 20 }}
                  />
                )}
                {node.employeeProfileId && (
                  <Chip
                    icon={<PersonIcon />}
                    label={node.employeeProfileId}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 11, height: 20 }}
                  />
                )}
              </Stack>
            </Box>

            {hasChildren && (
              <Tooltip title={`${node.children?.length} direct reports`}>
                <Chip
                  icon={<PeopleIcon />}
                  label={node.children?.length}
                  size="small"
                  color="primary"
                  variant="filled"
                />
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 3, mt: 1, position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                left: 12,
                top: 0,
                bottom: 0,
                width: 2,
                bgcolor: alpha(nodeColor, 0.2),
              }}
            />
            {renderChildren(node, depth)}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
