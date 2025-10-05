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

export interface HierarchyFilters {
  search: string;
  selectedManager: string | null;
}
