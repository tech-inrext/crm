import React from "react";
import { Box, Stack, Chip, Button, Divider } from "@/components/ui/Component";
import {
  ExpandMore,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from "@/components/ui/Component";
import { Employee } from "@/types/team-hierarchy";
import { HierarchyNode } from "./HierarchyNode";
import { HierarchyTreeProps } from "../types";


import { treeHeaderSx, treeHeaderStackSx } from "./styles";

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  hierarchy,
  expanded,
  selectedNode,
  searchQuery,
  onToggle,
  onSelect,
  onExpandAll,
  onCollapseAll,
  onClearSearch,
}) => {
  const renderTreeNode = (
    node: Employee,
    depth: number = 0
  ): React.ReactNode => {
    if (!node) return null;

    return (
      <HierarchyNode
        key={node._id}
        node={node}
        depth={depth}
        isOpen={expanded.has(node._id)}
        isSelected={selectedNode === node._id}
        onToggle={onToggle}
        onSelect={onSelect}
        renderChildren={(n, d) => (
          <>{(n.children || []).map((child) => renderTreeNode(child, d + 1))}</>
        )}
      />
    );
  };

  return (
    <Box>
      <Box>{renderTreeNode(hierarchy)}</Box>
    </Box>
  );
};
