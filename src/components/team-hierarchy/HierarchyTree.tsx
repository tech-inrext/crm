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

interface HierarchyTreeProps {
  hierarchy: Employee;
  expanded: Set<string>;
  selectedNode: string | null;
  searchQuery: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearSearch: () => void;
}

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
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip
            icon={<PersonIcon />}
            label={`Root: ${hierarchy.name}`}
            color="primary"
            variant="filled"
          />
          <Chip
            icon={<PeopleIcon />}
            label={`${(hierarchy.children || []).length} Direct Reports`}
            variant="outlined"
          />
          {searchQuery && (
            <Chip
              icon={<SearchIcon />}
              label={`Filtered: "${searchQuery}"`}
              onDelete={onClearSearch}
              color="secondary"
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ExpandMore />}
            onClick={onExpandAll}
          >
            Expand All
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ChevronRightIcon />}
            onClick={onCollapseAll}
          >
            Collapse All
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box>{renderTreeNode(hierarchy)}</Box>
    </Box>
  );
};
