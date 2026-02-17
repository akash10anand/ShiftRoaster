import { create } from "zustand";
import { Shift, ShiftRole } from "../types";
import { supabase } from "../lib/supabase";

interface ShiftStore {
  shifts: Shift[];
  loading: boolean;
  error: string | null;
  fetchShifts: () => Promise<void>;
  addShift: (
    shift: Omit<Shift, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  getShift: (id: string) => Shift | undefined;
  getShiftsByDate: (date: Date) => Shift[];
}

export const useShiftStore = create<ShiftStore>()((set, get) => ({
  shifts: [],
  loading: false,
  error: null,

  fetchShifts: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("*")
        .order("date", { ascending: false });

      if (shiftsError) throw shiftsError;

      // Fetch shift roles with role info
      const { data: shiftRolesData, error: rolesError } = await supabase
        .from("shift_roles")
        .select("*, roles(id, name)");

      if (rolesError) throw rolesError;

      // Fetch shift assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("shift_assignments")
        .select("shift_role_id, person_id");

      if (assignmentsError) throw assignmentsError;

      const shifts: Shift[] = (shiftsData || []).map((shift) => {
        // Get shift roles for this shift
        const shiftRoles =
          shiftRolesData
            ?.filter((sr: any) => sr.shift_id === shift.id)
            .map((sr: any) => {
              // Get assignments for this shift role
              const assignedPersonIds =
                assignmentsData
                  ?.filter((a: any) => a.shift_role_id === sr.id)
                  .map((a: any) => a.person_id) || [];

              return {
                id: sr.id,
                roleId: sr.role_id,
                roleName: sr.roles?.name || "",
                assignedPersonIds,
                requiredCount: sr.required_count,
              } as ShiftRole;
            }) || [];

        return {
          id: shift.id,
          name: shift.name,
          date: new Date(shift.date),
          startTime: shift.start_time,
          endTime: shift.end_time,
          roles: shiftRoles,
          createdAt: new Date(shift.created_at),
          updatedAt: new Date(shift.updated_at),
        };
      });

      set({ shifts, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching shifts:", error);
    }
  },

  addShift: async (shift) => {
    set({ loading: true, error: null });
    try {
      // Insert shift
      const { data: newShift, error: shiftError } = await supabase
        .from("shifts")
        .insert({
          name: shift.name,
          date: shift.date,
          start_time: shift.startTime,
          end_time: shift.endTime,
        })
        .select()
        .single();

      if (shiftError) throw shiftError;

      // Insert shift roles and assignments
      if (shift.roles && shift.roles.length > 0) {
        for (const role of shift.roles) {
          // Insert shift role
          const { data: shiftRole, error: roleError } = await supabase
            .from("shift_roles")
            .insert({
              shift_id: newShift.id,
              role_id: role.roleId,
              required_count: role.requiredCount,
            })
            .select()
            .single();

          if (roleError) throw roleError;

          // Insert assignments if any
          if (role.assignedPersonIds && role.assignedPersonIds.length > 0) {
            const assignments = role.assignedPersonIds.map((personId) => ({
              shift_role_id: shiftRole.id,
              person_id: personId,
            }));

            const { error: assignError } = await supabase
              .from("shift_assignments")
              .insert(assignments);

            if (assignError) throw assignError;
          }
        }
      }

      await get().fetchShifts();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error adding shift:", error);
    }
  },

  updateShift: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      // Update shift basic info
      const shiftUpdate: any = {};
      if (updatedData.name) shiftUpdate.name = updatedData.name;
      if (updatedData.date) shiftUpdate.date = updatedData.date;
      if (updatedData.startTime) shiftUpdate.start_time = updatedData.startTime;
      if (updatedData.endTime) shiftUpdate.end_time = updatedData.endTime;

      if (Object.keys(shiftUpdate).length > 0) {
        const { error: shiftError } = await supabase
          .from("shifts")
          .update(shiftUpdate)
          .eq("id", id);

        if (shiftError) throw shiftError;
      }

      // Update roles if provided
      if (updatedData.roles !== undefined) {
        // Delete existing shift roles (will cascade to assignments)
        const { error: deleteError } = await supabase
          .from("shift_roles")
          .delete()
          .eq("shift_id", id);

        if (deleteError) throw deleteError;

        // Insert new shift roles
        for (const role of updatedData.roles) {
          const { data: shiftRole, error: roleError } = await supabase
            .from("shift_roles")
            .insert({
              shift_id: id,
              role_id: role.roleId,
              required_count: role.requiredCount,
            })
            .select()
            .single();

          if (roleError) throw roleError;

          // Insert assignments
          if (role.assignedPersonIds && role.assignedPersonIds.length > 0) {
            const assignments = role.assignedPersonIds.map((personId) => ({
              shift_role_id: shiftRole.id,
              person_id: personId,
            }));

            const { error: assignError } = await supabase
              .from("shift_assignments")
              .insert(assignments);

            if (assignError) throw assignError;
          }
        }
      }

      await get().fetchShifts();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error updating shift:", error);
    }
  },

  deleteShift: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("shifts").delete().eq("id", id);

      if (error) throw error;

      await get().fetchShifts();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error deleting shift:", error);
    }
  },

  getShift: (id) => {
    return get().shifts.find((shift) => shift.id === id);
  },

  getShiftsByDate: (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return get().shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate.getTime() === targetDate.getTime();
    });
  },
}));
