import { create } from "zustand";
import { Group } from "../types";
import { supabase } from "../lib/supabase";

interface GroupStore {
  groups: Group[];
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  addGroup: (
    group: Omit<Group, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  getGroup: (id: string) => Group | undefined;
}

export const useGroupStore = create<GroupStore>()((set, get) => ({
  groups: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .order("name");

      if (groupsError) throw groupsError;

      // Fetch group members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("group_id, person_id");

      if (membersError) throw membersError;

      const groups: Group[] = (groupsData || []).map((group) => {
        const personIds =
          membersData
            ?.filter((m: any) => m.group_id === group.id)
            .map((m: any) => m.person_id) || [];

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          personIds,
          createdAt: new Date(group.created_at),
          updatedAt: new Date(group.updated_at),
        };
      });

      set({ groups, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching groups:", error);
    }
  },

  addGroup: async (group) => {
    set({ loading: true, error: null });
    try {
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: group.name,
          description: group.description,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Insert group members
      if (group.personIds && group.personIds.length > 0) {
        const memberRecords = group.personIds.map((personId) => ({
          group_id: newGroup.id,
          person_id: personId,
        }));

        const { error: membersError } = await supabase
          .from("group_members")
          .insert(memberRecords);

        if (membersError) throw membersError;
      }

      await get().fetchGroups();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error adding group:", error);
    }
  },

  updateGroup: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const groupUpdate: any = {};
      if (updatedData.name) groupUpdate.name = updatedData.name;
      if (updatedData.description !== undefined)
        groupUpdate.description = updatedData.description;

      if (Object.keys(groupUpdate).length > 0) {
        const { error: groupError } = await supabase
          .from("groups")
          .update(groupUpdate)
          .eq("id", id);

        if (groupError) throw groupError;
      }

      // Update members if provided
      if (updatedData.personIds !== undefined) {
        // Delete existing members
        const { error: deleteError } = await supabase
          .from("group_members")
          .delete()
          .eq("group_id", id);

        if (deleteError) throw deleteError;

        // Insert new members
        if (updatedData.personIds.length > 0) {
          const memberRecords = updatedData.personIds.map((personId) => ({
            group_id: id,
            person_id: personId,
          }));

          const { error: insertError } = await supabase
            .from("group_members")
            .insert(memberRecords);

          if (insertError) throw insertError;
        }
      }

      await get().fetchGroups();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error updating group:", error);
    }
  },

  deleteGroup: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("groups").delete().eq("id", id);

      if (error) throw error;

      await get().fetchGroups();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error deleting group:", error);
    }
  },

  getGroup: (id) => {
    return get().groups.find((group) => group.id === id);
  },
}));
