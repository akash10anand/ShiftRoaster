import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Roster, RosterShift, RosterShiftRole } from "../types/roster";
import { supabase } from "../lib/supabase";

interface RosterStore {
  rosters: Roster[];
  shifts: RosterShift[];
  loading: boolean;
  error: string | null;
  fetchRosters: () => Promise<void>;
  addRoster: (
    roster: Omit<Roster, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateRoster: (id: string, roster: Partial<Roster>) => Promise<void>;
  deleteRoster: (id: string) => Promise<void>;
  getRoster: (id: string) => Roster | undefined;
  getRosterShifts: (rosterId: string) => RosterShift[];
  addRosterShift: (
    shift: Omit<RosterShift, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateRosterShift: (id: string, shift: Partial<RosterShift>) => Promise<void>;
  deleteRosterShift: (id: string) => Promise<void>;
  assignPersonToShiftRole: (
    rosterShiftRoleId: string,
    personId: string,
  ) => Promise<void>;
  removePersonFromShiftRole: (
    rosterShiftRoleId: string,
    personId: string,
  ) => Promise<void>;
}

export const useRosterStore = create<RosterStore>()(
  persist(
    (set, get) => ({
      rosters: [],
      shifts: [],
      loading: false,
      error: null,

      fetchRosters: async () => {
        set({ loading: true, error: null });
        try {
          // Fetch rosters
          const { data: rostersData, error: rostersError } = await supabase
            .from("rosters")
            .select("*")
            .order("start_date", { ascending: false });

          if (rostersError) throw rostersError;

          // Fetch roster shifts
          const { data: shiftsData, error: shiftsError } = await supabase
            .from("roster_shifts")
            .select("*")
            .order("date", { ascending: true });

          if (shiftsError) throw shiftsError;

          // Fetch roster shift roles
          const { data: rolesData, error: rolesError } = await supabase
            .from("roster_shift_roles")
            .select("*, roles(id, name)");

          if (rolesError) throw rolesError;

          // Fetch roster shift assignments
          const { data: assignmentsData, error: assignmentsError } =
            await supabase
              .from("roster_shift_assignments")
              .select("roster_shift_role_id, person_id");

          if (assignmentsError) throw assignmentsError;

          const rosters: Roster[] = (rostersData || []).map((roster) => ({
            id: roster.id,
            name: roster.name,
            startDate: new Date(roster.start_date),
            endDate: new Date(roster.end_date),
            createdAt: new Date(roster.created_at),
            updatedAt: new Date(roster.updated_at),
          }));

          const shifts: RosterShift[] = (shiftsData || []).map((shift) => {
            // Get roles for this shift
            const shiftRoles = (rolesData || [])
              .filter((role) => role.roster_shift_id === shift.id)
              .map((role) => {
                // Get assigned people for this role
                const assignedPersonIds = (assignmentsData || [])
                  .filter(
                    (assignment) => assignment.roster_shift_role_id === role.id,
                  )
                  .map((assignment) => assignment.person_id);

                return {
                  id: role.id,
                  roleId: role.role_id,
                  roleName: role.roles?.name || "",
                  assignedPersonIds,
                  requiredCount: role.required_count,
                };
              });

            return {
              id: shift.id,
              rosterId: shift.roster_id,
              templateId: shift.template_id,
              date: new Date(shift.date),
              roles: shiftRoles,
              createdAt: new Date(shift.created_at),
              updatedAt: new Date(shift.updated_at),
            };
          });

          set({ rosters, shifts, loading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch rosters";
          set({ error: message, loading: false });
          console.error("Error fetching rosters:", error);
        }
      },

      addRoster: async (roster) => {
        try {
          const { error } = await supabase.from("rosters").insert({
            name: roster.name,
            start_date: roster.startDate.toISOString().split("T")[0],
            end_date: roster.endDate.toISOString().split("T")[0],
          });

          if (error) throw error;

          // Refresh rosters list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to add roster";
          set({ error: message });
          throw error;
        }
      },

      updateRoster: async (id, updates) => {
        try {
          const { error } = await supabase
            .from("rosters")
            .update({
              name: updates.name,
              start_date: updates.startDate?.toISOString().split("T")[0],
              end_date: updates.endDate?.toISOString().split("T")[0],
            })
            .eq("id", id);

          if (error) throw error;

          // Refresh rosters list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update roster";
          set({ error: message });
          throw error;
        }
      },

      deleteRoster: async (id) => {
        try {
          const { error } = await supabase
            .from("rosters")
            .delete()
            .eq("id", id);

          if (error) throw error;

          // Refresh rosters list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to delete roster";
          set({ error: message });
          throw error;
        }
      },

      getRoster: (id) => {
        return get().rosters.find((r) => r.id === id);
      },

      getRosterShifts: (rosterId) => {
        return get().shifts.filter((shift) => shift.rosterId === rosterId);
      },

      addRosterShift: async (shift) => {
        try {
          // Insert roster shift
          const { data: newShift, error: insertError } = await supabase
            .from("roster_shifts")
            .insert({
              roster_id: shift.rosterId,
              template_id: shift.templateId,
              date: shift.date.toISOString().split("T")[0],
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Insert roster shift roles
          if (shift.roles.length > 0) {
            const rolesData = shift.roles.map((role) => ({
              roster_shift_id: newShift.id,
              role_id: role.roleId,
              required_count: role.requiredCount || 1,
            }));

            const { error: rolesInsertError } = await supabase
              .from("roster_shift_roles")
              .insert(rolesData);

            if (rolesInsertError) throw rolesInsertError;

            // Insert roster shift assignments
            for (const role of shift.roles) {
              if (role.assignedPersonIds.length > 0) {
                const shiftRole = (
                  await supabase
                    .from("roster_shift_roles")
                    .select("id")
                    .eq("roster_shift_id", newShift.id)
                    .eq("role_id", role.roleId)
                    .single()
                ).data;

                if (shiftRole) {
                  const assignmentsData = role.assignedPersonIds.map(
                    (personId) => ({
                      roster_shift_role_id: shiftRole.id,
                      person_id: personId,
                    }),
                  );

                  const { error: assignmentsError } = await supabase
                    .from("roster_shift_assignments")
                    .insert(assignmentsData);

                  if (assignmentsError) throw assignmentsError;
                }
              }
            }
          }

          // Refresh shifts list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to add roster shift";
          set({ error: message });
          throw error;
        }
      },

      updateRosterShift: async (id, updates) => {
        try {
          const { error } = await supabase
            .from("roster_shifts")
            .update({
              date: updates.date?.toISOString().split("T")[0],
            })
            .eq("id", id);

          if (error) throw error;

          // If updating roles, delete old and insert new
          if (updates.roles) {
            const { error: deleteError } = await supabase
              .from("roster_shift_roles")
              .delete()
              .eq("roster_shift_id", id);

            if (deleteError) throw deleteError;

            if (updates.roles.length > 0) {
              const rolesData = updates.roles.map((role) => ({
                roster_shift_id: id,
                role_id: role.roleId,
                required_count: role.requiredCount || 1,
              }));

              const { error: rolesInsertError } = await supabase
                .from("roster_shift_roles")
                .insert(rolesData);

              if (rolesInsertError) throw rolesInsertError;
            }
          }

          // Refresh shifts list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update roster shift";
          set({ error: message });
          throw error;
        }
      },

      deleteRosterShift: async (id) => {
        try {
          const { error } = await supabase
            .from("roster_shifts")
            .delete()
            .eq("id", id);

          if (error) throw error;

          // Refresh shifts list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete roster shift";
          set({ error: message });
          throw error;
        }
      },

      assignPersonToShiftRole: async (rosterShiftRoleId, personId) => {
        try {
          const { error } = await supabase
            .from("roster_shift_assignments")
            .insert({
              roster_shift_role_id: rosterShiftRoleId,
              person_id: personId,
            });

          if (error) throw error;

          // Refresh shifts list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to assign person";
          set({ error: message });
          throw error;
        }
      },

      removePersonFromShiftRole: async (rosterShiftRoleId, personId) => {
        try {
          const { error } = await supabase
            .from("roster_shift_assignments")
            .delete()
            .eq("roster_shift_role_id", rosterShiftRoleId)
            .eq("person_id", personId);

          if (error) throw error;

          // Refresh shifts list
          await get().fetchRosters();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to remove person";
          set({ error: message });
          throw error;
        }
      },
    }),
    {
      name: "roster-store",
    },
  ),
);
