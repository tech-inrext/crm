// ─── Domain models ────────────────────────────────────────────────────────────

export interface ManagerRef {
  _id: string;
  name: string;
  email?: string;
}

export interface Department {
  _id: string;
  id?: string;
  departmentId: string;
  name: string;
  description?: string;
  managerId?: string | ManagerRef;
  isActive: boolean;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Attachment {
  filename: string;
  url: string;
  uploadedAt?: string;
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface FetchDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ManagerItem {
  _id: string;
  name: string;
  email?: string;
  designation?: string;
}

// ─── Form types ───────────────────────────────────────────────────────────────

export interface DepartmentAttachment {
  filename: string;
  url: string;
}

export interface DepartmentFormData {
  name: string;
  description: string;
  managerId: string;
  attachments: DepartmentAttachment[];
}

// ─── Component prop types ─────────────────────────────────────────────────────

export interface DepartmentDialogProps {
  open: boolean;
  editId: string | null;
  initialData: DepartmentFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: DepartmentFormData) => void;
}

export interface DepartmentCardProps {
  department: Department;
  onEdit?: () => void;
}

export interface DepartmentsListProps {
  search?: string;
  onEditDepartment: (dept: Department) => void;
}

export interface DepartmentsActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

export interface TostProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}
