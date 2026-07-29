export interface LeaveRequestPayload {
  leaveType: string;
  startDate: string | Date;
  endDate: string | Date;
  daysRequested: number;
  reason: string;
  attachmentUrl?: string;
}

export interface LeaveActionPayload {
  leaveId: string;
  status: "Approved" | "Rejected";
  managerRemarks?: string;
}

export interface EmployeeStub {
  _id: string;
  name: string;
  email: string;
  employeeProfileId?: string;
  photo?: string;
  designation?: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string | EmployeeStub;
  managerId: string | EmployeeStub;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  attachmentUrl: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  managerRemarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypeStat {
  leaveType: string;
  quota: number;
  taken: number;
  pending: number;
  remaining: number;
}

export interface LeaveStatsData {
  summary: {
    totalAllocated: number;
    totalTaken: number;
    totalPending: number;
    totalRemaining: number;
  };
  breakdown: LeaveTypeStat[];
}

