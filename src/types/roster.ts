// Shift Template - reusable shift pattern
export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  roles: ShiftTemplateRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftTemplateRole {
  id: string;
  roleId: string;
  roleName: string;
  requiredCount?: number;
}

// Roster - 7-day (or custom period) roster
export interface Roster {
  id: string;
  name: string; // e.g., "Week of Feb 17-23"
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Roster Shift - actual shift on a specific day
export interface RosterShift {
  id: string;
  rosterId: string;
  templateId: string;
  date: Date;
  roles: RosterShiftRole[];
  createdAt: Date;
  updatedAt: Date;
}

// Roster Shift Role - role assignment within a roster shift
export interface RosterShiftRole {
  id: string;
  roleId: string;
  roleName: string;
  assignedPersonIds: string[];
  requiredCount?: number;
}
