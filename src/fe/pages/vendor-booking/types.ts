export type VendorBooking = {
  _id: string;
  bookingId?: string;
  project: string | { _id: string; name: string };
  clientName: string;
  numberOfClients?: number;
  pickupPoint: string;
  dropPoint: string;
  requestedDateTime: string;
  status:
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected"
  | "payment_due";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  managerId?: string | { _id: string; name?: string; username?: string };
  managerName?: string;
  canApprove?: boolean;
  cabBookedBy?: string | { _id: string; name?: string };
  ownerName?: string;
  cabOwner?: string;
  driverName?: string;
  aadharNumber?: string;
  dlNumber?: string;
  fare?: number;
  totalKm?: number;
  odometerStartImageUrl?: string;
  odometerEndImageUrl?: string;
};

export interface VendorBookingCardProps {
  booking: VendorBooking;
  canWrite: boolean;
  onViewDetails: (booking: VendorBooking) => void;
  onOpenForm: (bookingId: string, booking: VendorBooking) => void;
}

export interface VendorBookingActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export interface VendorBookingFormProps {
  disabled?: boolean;
  bookingId?: string | null;
  onSubmit?: (formData: any) => void;
  onClose?: () => void;
}

export interface VendorBookingsListProps {
  onViewDetails: (booking: VendorBooking) => void;
  onOpenForm: (bookingId: string, booking: VendorBooking) => void;
  canWrite: boolean;
  onReady?: (refetch: () => void) => void;
  search?: string;
  statusFilter?: string;
}

export interface VendorBookingFormValues {
  cabOwner: string;
  driverName: string;
  aadharNumber: string;
  dlNumber: string;
  startKm: string | number;
  endKm: string | number;
  odometerStart: File | string | null;
  odometerEnd: File | string | null;
  fare: string | number | null;
  pickupPoint: string;
  dropPoint: string;
}

export interface VendorFormFieldsProps {
  disabled?: boolean;
  totalKm?: number | string;
}

export interface UseVendorBookingFormProps {
  onSubmit?: (payload: any) => void;
}

export interface VendorBookingsSkeletonProps {
  count?: number;
}
