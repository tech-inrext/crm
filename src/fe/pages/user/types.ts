// Centralized types for the user module
export interface RoleObject {
  _id: string;
  name: string;
  read?: string[];
  write?: string[];
  delete?: string[];
  isSystemAdmin?: boolean;
  // optional analytics flags
  showTotalUsers?: boolean;
  showTotalVendorsBilling?: boolean;
  showCabBookingAnalytics?: boolean;
  showScheduleThisWeek?: boolean;
}

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
  aadharFile?: File | null;
  panFile?: File | null;
  bankProofFile?: File | null;
  aadharUrl?: string;
  panUrl?: string;
  bankProofUrl?: string;
  photoFile?: File | null;
  photoUrl?: string;
  panNumber: string;
  nominee?: {
    name?: string;
    phone?: string;
    occupation?: string;
    relation?: string;
    gender?: string;
  };
}

export interface UserDialogProps {
  open: boolean;
  editId: string | null;
  initialData: UserFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: UserFormData) => void;
}

export interface UserCardProps {
  user: {
    name: string;
    email: string;
    designation?: string;
    avatarUrl?: string;
  };
  onEdit?: () => void;
}

export interface UsersListProps {
  loading: boolean;
  employees: any[];
  isMobile: boolean;
  isClient: boolean;
  windowWidth: number;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  usersTableHeader: any[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditUser: (user: any) => void;
  canEdit: (user: any) => boolean;
}

export interface UsersActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

export interface UserData {
  name: string;
  phone: string;
  email: string;
  altPhone: string;
  photo: string;
  designation: string;
  specialization: string;
  branch: string;
}

export interface Employee {
  _id?: string;
  name: string;
  email: string;
  designation?: string;
  roles?: Array<{ _id: string; name: string }>;
  isCabVendor?: boolean;
  [key: string]: any;
}

export default {};
