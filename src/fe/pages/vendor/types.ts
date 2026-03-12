export interface RoleItem {
  _id: string;
  name: string;
}

export interface ManagerItem {
  _id: string;
  name: string;
  email?: string;
}

export interface DepartmentItem {
  _id: string;
  name: string;
}

export interface Vendor {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  designation?: string;
  roles?: RoleItem[];
  managerId?: string;
  departmentId?: string;
  isCabVendor?: boolean;
  joiningDate?: string;
  altPhone?: string;
  avatarUrl?: string;
  [key: string]: any;
}

export interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface VendorsPageActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving?: boolean;
}

export interface VendorDialogProps {
  open: boolean;
  editId: string | null;
  initialData: VendorFormData;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export interface VendorCardProps {
  vendor: Vendor;
  onEdit?: () => void;
}

export interface VendorsListProps {
  loading: boolean;
  vendors: Vendor[];
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onEditVendor: (vendor: Vendor) => void;
}

export interface ToastProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}
