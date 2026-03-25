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
} from "@/components/ui/Component";
import { Employee, HierarchyNodeProps } from "../types";
import { HIERARCHY_COLORS, getNodeColor } from "../constants/teams";
import { getPersonalInfo } from "../utils";
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
  const childrenCount = node.children?.length ?? 0;
  const hasChildren = childrenCount > 0;
  const nodeColor = getNodeColor(depth, HIERARCHY_COLORS);
  const personalInfo = getPersonalInfo(node);

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
              badgeContent={childrenCount}
              color="primary"
              invisible={!hasChildren}
            >
              <Avatar sx={avatarSx(nodeColor)}>
                {(node.name?.[0] || "?").toUpperCase()}
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={nodeNameSx}>
                {node.name || "Unknown"}
              </Typography>

              <Stack direction="row" spacing={1} sx={nodeChipsStackSx}>
                {personalInfo.map(({ id, icon, value }) => (
                  <Chip
                    key={id}
                    icon={icon}
                    label={value}
                    size="small"
                    variant="outlined"
                    sx={nodeChipSx}
                  />
                ))}
              </Stack>
            </Box>

            {hasChildren && (
              <Tooltip title={`${childrenCount} direct reports`}>
                <Chip
                  icon={<People />}
                  label={childrenCount}
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
