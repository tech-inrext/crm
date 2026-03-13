// ─── Domain models ────────────────────────────────────────────────────────────

export interface Employee {
  _id: string;
  name: string;
  designation?: string;
  branch?: string;
  managerId?: string;
  employeeProfileId?: string;
  children?: Employee[];
}

export interface HierarchyState {
  hierarchy: Employee | null;
  loading: boolean;
  error: string | null;
  expanded: Set<string>;
  selectedNode: string | null;
  totalCount: number;
}
export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export interface HierarchyControlsProps {
  employees: Employee[];
  selectedManager: string | null;
  totalCount: number;
  search: string;
  loading: boolean;
  onManagerChange: (managerId: string | null) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}
export interface HierarchyHeaderProps {
  children: React.ReactNode;
}
export interface HeirarcyNodeProps {
  node: Employee;
  depth: number;
  isOpen: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  renderChildren: (node: Employee, depth: number) => React.ReactNode;
}
export interface HierarchyTreeProps {
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