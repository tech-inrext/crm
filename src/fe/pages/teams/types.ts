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


export interface AllEmployeeSearchBarProps {
  options: any[];
  onSelect: (id: string | null) => void;
  loading?: boolean;
  selectedId?: string | null;
  placeholder?: string;
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
  onClearSearch?: () => void;
  
  // Admin search props
  isAdmin?: boolean;
  employeeOptions?: any[];
  hierarchyOptions?: any[];
  onEmployeeSelect?: (employeeId: string | null) => void;
  isEmployeeLoading?: boolean;
  selectedEmployeeId?: string | null;
  
  // Hierarchy selection props
  selectedHierarchyId?: string | null;
  onHierarchySelect?: (employeeId: string | null) => void;
}

export interface HierarchyControlsProps {
  totalCount: number;
  search: string;
  loading: boolean;
  hierarchy?: Employee | null;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
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
  onClearSearch: () => void;
}

export interface EmptyStateProps {
  isSearchEmpty?: boolean;
}