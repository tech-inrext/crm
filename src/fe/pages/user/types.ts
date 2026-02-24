// ─── Shared primitives ───────────────────────────────────────────────────────

export interface RoleObject {
  _id: string;
  name: string;
  read?: string[];
  write?: string[];
  delete?: string[];
  isSystemAdmin?: boolean;
  showTotalUsers?: boolean;
  showTotalVendorsBilling?: boolean;
  showCabBookingAnalytics?: boolean;
  showScheduleThisWeek?: boolean;
}

export interface NomineeDetails {
  name?: string;
  phone?: string;
  occupation?: string;
  relation?: string;
  gender?: string;
}

// ─── Domain models ────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  photo?: string;
  avatarUrl?: string;
  designation?: string;
  specialization?: string;
  branch?: string;
  roles?: RoleObject[];
  currentRole?: string | RoleObject;
  isSystemAdmin?: boolean;
  departmentId?: string;
  managerId?: string;
  joiningDate?: string;
  gender?: string;
  address?: string;
}

export interface Employee {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  avatarUrl?: string;
  roles?: RoleObject[];
  isSystemAdmin?: boolean;
  departmentId?: string;
  managerId?: string;
  isCabVendor?: boolean;
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isCabVendor?: boolean;
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

export interface UploadPresignResponse {
  uploadUrl: string;
  fileUrl: string;
}

export interface RoleItem {
  _id: string;
  name: string;
}

export interface ManagerItem {
  _id: string;
  name: string;
  email?: string;
  designation?: string;
}

export interface DepartmentItem {
  _id: string;
  name: string;
}

// ─── Form types ───────────────────────────────────────────────────────────────

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth?: string;
  altPhone?: string;
  fatherName?: string;
  specialization?: string;
  joiningDate?: string;
  designation: string;
  managerId: string;
  departmentId: string;
  roles: string[];
  panNumber: string;
  slabPercentage?: string;
  branch?: string;
  // Files – present before upload
  aadharFile?: File | null;
  panFile?: File | null;
  bankProofFile?: File | null;
  signatureFile?: File | null;
  photoFile?: File | null;
  // URLs – present after upload
  aadharUrl?: string;
  panUrl?: string;
  bankProofUrl?: string;
  signatureUrl?: string;
  photo?: string;
  nominee?: NomineeDetails | null;
}

// ─── Table ────────────────────────────────────────────────────────────────────

export interface TableHeaderItem {
  label: string;
  dataKey?: string;
  component?: string | ((row: Employee) => React.ReactNode);
}

// ─── Component prop types ─────────────────────────────────────────────────────

export interface UserDialogProps {
  open: boolean;
  editId: string | null;
  initialData: UserFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: UserFormData) => void;
}

export interface UserCardProps {
  user: Pick<Employee, "name" | "email" | "designation" | "avatarUrl">;
  onEdit?: () => void;
}

export interface UsersListProps {
  loading: boolean;
  employees: Employee[];
  isMobile: boolean;
  isClient: boolean;
  windowWidth: number;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  usersTableHeader: TableHeaderItem[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditUser: (user: Employee) => void;
  canEdit: (user: Employee) => boolean;
}

export interface UsersActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}
