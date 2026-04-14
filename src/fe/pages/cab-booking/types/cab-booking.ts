// Project type
export type Project = { 
  _id: string; 
  name: string; 
};

export type EmployeeLite = {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
};

// Booking type
export type Booking = {
  _id: string;
  project: string | Project;
  projectDetails?: Project;
  clientName: string;
  numberOfClients: number;
  pickupPoint: string;
  cabBookedBy: string;
  dropPoint: string;
  employeeName?: string;
  requestedDateTime: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  status: "pending" | "approved" | "completed" | "cancelled" | "rejected";
  driverDetails?: {
    _id: string;
    username: string;
    phoneNumber?: string;
  };
  vehicleDetails?: {
    model: string;
    registrationNumber: string;
    type: string;
    capacity: number;
  };
  teamLeader?: string;
  teamLeaderDetails?: {
    username: string;
    phoneNumber?: string;
  };
  currentLocation?: string;
  estimatedArrival?: string;
  ownerName?: string;
  driverName?: string;
  teamHead?: string;
  totalKm?: number;
  driver?: string;
  vehicle?: string;
  managerId?: string;
  canApprove?: boolean;
  // ✅ managerId can be id or populated object
  managerId?: string | EmployeeLite;
  // ✅ convenience added by API
  managerName?: string;

  canApprove?: boolean;
};

export interface CabBookingProps {
  defaultView?: "form" | "tracking" | "vendortracking";
}

export interface BookingFormData {
  project: string;
  clientName: string;
  numberOfClients: number;
  pickupPoint: string;
  dropPoint: string;
  employeeName: string;
  requestedDateTime: string;
  notes: string;
}

export interface TrackingData {
  currentLocation: string;
  estimatedArrival: string;
}
