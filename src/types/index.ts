export interface Person {
  id: string;
  name: string;
  phone: string;
  designation: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  personIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  roles: ShiftRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftRole {
  id: string;
  roleId: string;
  roleName: string;
  assignedPersonIds: string[];
  requiredCount?: number;
}

export interface Leave {
  id: string;
  personId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalPeople: number;
  totalRoles: number;
  totalGroups: number;
  totalShifts: number;
  peopleOnLeave: number;
}
