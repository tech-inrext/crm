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
