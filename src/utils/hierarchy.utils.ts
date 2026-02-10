import { Employee } from "@/types/team-hierarchy";

export const countNodes = (node: Employee | null): number => {
  if (!node) return 0;
  
  let count = 1;
  (node.children || []).forEach((child) => {
    count += countNodes(child);
  });
  
  return count;
};

export const filterHierarchy = (
  hierarchy: Employee | null,
  searchQuery: string
): Employee | null => {
  if (!hierarchy || !searchQuery) return hierarchy;

  const query = searchQuery.toLowerCase();

  const filterNode = (node: Employee): Employee | null => {
    const match =
      (node.name || "").toLowerCase().includes(query) ||
      (node.designation || "").toLowerCase().includes(query);

    const filteredChildren = (node.children || [])
      .map(filterNode)
      .filter((child): child is Employee => child !== null);

    if (match || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }

    return null;
  };

  return filterNode(hierarchy);
};

export const expandAllNodes = (node: Employee | null): Set<string> => {
  const ids = new Set<string>();

  const collect = (n: Employee) => {
    ids.add(n._id);
    (n.children || []).forEach(collect);
  };

  if (node) {
    collect(node);
  }

  return ids;
};

export const getNodeColor = (depth: number, colors: readonly string[]): string => {
  return colors[depth % colors.length];
};
