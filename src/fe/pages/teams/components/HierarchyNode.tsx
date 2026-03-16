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
  ExpandLess,
  ChevronRight,
  People,
  Work,
  LocationOn,
  Person,
} from "@/components/ui/Component";
import { Employee , HierarchyNodeProps} from "../types";
import { HIERARCHY_COLORS, getNodeColor} from "../constants/teams";
import {
  nodeWrapperSx,
  nodeNameSx,
  nodeChipsStackSx,
  nodeChipSx,
  nodeCardSx,
  expandButtonSx,
  avatarSx,
  childrenCollapseWrapper1Sx,
  childrenCollapseWrapper2Sx,
} from "./styles";

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
    <Box sx={nodeWrapperSx}>
      <Card
        variant="outlined"
        sx={nodeCardSx(nodeColor, isSelected)}
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
                  sx={expandButtonSx(nodeColor)}
                >
                  {isOpen ? <ExpandLess /> : <ChevronRight />}
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
                sx={avatarSx(nodeColor)}
              >
                {node.name ? node.name.charAt(0).toUpperCase() : "?"}
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={nodeNameSx}>
                {node.name || "Unknown"}
              </Typography>

              <Stack direction="row" spacing={1} sx={nodeChipsStackSx}>
                {node.designation && (
                  <Chip
                    icon={<Work />}
                    label={node.designation}
                    size="small"
                    variant="outlined"
                    sx={nodeChipSx}
                  />
                )}
                {node.branch && (
                  <Chip
                    icon={<LocationOn />}
                    label={node.branch}
                    size="small"
                    variant="outlined"
                    sx={nodeChipSx}
                  />
                )}
                {node.employeeProfileId && (
                  <Chip
                    icon={<Person />}
                    label={node.employeeProfileId}
                    size="small"
                    variant="outlined"
                    sx={nodeChipSx}
                  />
                )}
              </Stack>
            </Box>

            {hasChildren && (
              <Tooltip title={`${node.children?.length} direct reports`}>
                <Chip
                  icon={<People />}
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
          <Box sx={childrenCollapseWrapper1Sx}>
            <Box
              sx={childrenCollapseWrapper2Sx(nodeColor)}
            />
            {renderChildren(node, depth)}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};