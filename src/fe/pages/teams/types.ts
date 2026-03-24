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

export interface TeamsActionBarProps {
  totalCount: number;
  search: string;
  loading: boolean;
  managerName?: string;
  hierarchy?: Employee | null;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onClearSearch?: () => void;
}

export interface HierarchyControlsProps {
  totalCount: number;
  search: string;
  loading: boolean;
  hierarchy?: Employee | null;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onClearSearch?: () => void;
}
export interface HierarchyNodeProps {
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

export interface EmptyStateProps {
  isSearchEmpty?: boolean;
}