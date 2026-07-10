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
  leadId?: {
    _id: string;
    fullName?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    mobileNo?: string;
    phone?: string;
    phoneNumber?: string;
  };
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
  driverPhone?: string;
  cabRegistrationNumber?: string;
  teamHead?: string;
  startKm?: number;
  endKm?: number;
  odometerStartImageUrl?: string;
  odometerEndImageUrl?: string;
  fare?: number;
  driver?: string;
  vehicle?: string;
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
