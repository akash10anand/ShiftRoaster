import { create } from "zustand";
import { Role } from "../types";
import { supabase } from "../lib/supabase";

interface RoleStore {
  roles: Role[];
  loading: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  addRole: (
    role: Omit<Role, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  getRole: (id: string) => Role | undefined;
}

export const useRoleStore = create<RoleStore>()((set, get) => ({
  roles: [],
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;

      const roles: Role[] = (data || []).map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: new Date(role.created_at),
        updatedAt: new Date(role.updated_at),
      }));

      set({ roles, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching roles:", error);
    }
  },

  addRole: async (role) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("roles").insert({
        name: role.name,
        description: role.description,
      });

      if (error) throw error;

      await get().fetchRoles();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error adding role:", error);
    }
  },

  updateRole: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};
      if (updatedData.name) updateData.name = updatedData.name;
      if (updatedData.description !== undefined)
        updateData.description = updatedData.description;

      const { error } = await supabase
        .from("roles")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await get().fetchRoles();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error updating role:", error);
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("roles").delete().eq("id", id);

      if (error) throw error;

      await get().fetchRoles();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error deleting role:", error);
    }
  },

  getRole: (id) => {
    return get().roles.find((role) => role.id === id);
  },
}));
