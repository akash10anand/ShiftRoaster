import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePersonStore } from "../stores/personStore";
import { useRoleStore } from "../stores/roleStore";
import { useGroupStore } from "../stores/groupStore";
import { useShiftStore } from "../stores/shiftStore";
import { useLeaveStore } from "../stores/leaveStore";
import { useShiftTemplateStore } from "../stores/shiftTemplateStore";
import { useRosterStore } from "../stores/rosterStore";

/**
 * Hook to initialize all stores by fetching data from Supabase
 * Call this once in the App component
 */
export function useInitializeStores() {
  const { user, loading: authLoading } = useAuth();
  const fetchPeople = usePersonStore((state) => state.fetchPeople);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  const fetchShifts = useShiftStore((state) => state.fetchShifts);
  const fetchLeaves = useLeaveStore((state) => state.fetchLeaves);
  const fetchTemplates = useShiftTemplateStore((state) => state.fetchTemplates);
  const fetchRosters = useRosterStore((state) => state.fetchRosters);

  useEffect(() => {
    // Only fetch if user is authenticated and auth is done loading
    if (!authLoading && user) {
      const initializeData = async () => {
        try {
          // Fetch roles first as they're referenced by other entities
          await fetchRoles();

          // Then fetch people (references roles)
          await fetchPeople();

          // Then fetch the rest in parallel
          await Promise.all([
            fetchGroups(),
            fetchShifts(),
            fetchLeaves(),
            fetchTemplates(),
            fetchRosters(),
          ]);
        } catch (error) {
          console.error("Error initializing stores:", error);
        }
      };

      initializeData();
    }
  }, [
    authLoading,
    user,
    fetchPeople,
    fetchRoles,
    fetchGroups,
    fetchShifts,
    fetchLeaves,
    fetchTemplates,
    fetchRosters,
  ]);
}
