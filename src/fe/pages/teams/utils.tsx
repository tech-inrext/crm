import React from "react";
import { Work, LocationOn, Person } from "@/components/ui/Component";
import { Employee } from "./types";

/**
 * Returns a filtered list of personal information for a given employee node.
 * Each item contains a unique ID, an icon component, and the value.
 */
export const getPersonalInfo = (node: Employee) =>
  [
    { id: "designation", icon: <Work />, value: node.designation },
    { id: "branch", icon: <LocationOn />, value: node.branch },
    { id: "profileId", icon: <Person />, value: node.employeeProfileId },
  ].filter((item) => item.value);

/**
 * Recursively counts the total number of nodes in the hierarchy tree.
 */
export const countNodes = (node: Employee | null): number => {
  if (!node) return 0;
  
  let count = 1;
  (node.children || []).forEach((child) => {
    count += countNodes(child);
  });
  
  return count;
};

/**
 * Filters the hierarchy tree based on a search query (name or designation).
 * Returns a new tree containing only matching nodes and their ancestors.
 */
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

/**
 * Returns a Set of all node IDs in the hierarchy tree.
 * Used for "Expand All" functionality.
 */
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

/**
 * Flattens the hierarchy tree into a linear array of unique employees.
 */
export const flattenHierarchy = (node: Employee | null): Employee[] => {
  const employees: Employee[] = [];
  if (!node) return employees;

  const collect = (n: Employee) => {
    const { children, ...rest } = n;
    employees.push(rest as Employee);
    if (children && Array.isArray(children)) {
      children.forEach(collect);
    }
  };

  collect(node);
  return employees;
};

/**
 * Returns a list of parent IDs for a given target node ID.
 * Used to expand the path to a selected node.
 */
export const findPathToNode = (
  node: Employee | null,
  targetId: string,
  path: string[] = []
): string[] | null => {
  if (!node) return null;
  if (node._id === targetId) return path;

  for (const child of node.children || []) {
    const result = findPathToNode(child, targetId, [...path, node._id]);
    if (result) return result;
  }

  return null;
};
