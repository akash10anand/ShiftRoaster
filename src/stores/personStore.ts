import { create } from "zustand";
import { Person } from "../types";
import { supabase } from "../lib/supabase";

interface PersonStore {
  people: Person[];
  loading: boolean;
  error: string | null;
  fetchPeople: () => Promise<void>;
  addPerson: (
    person: Omit<Person, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updatePerson: (id: string, person: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  getPerson: (id: string) => Person | undefined;
  searchPeople: (query: string) => Person[];
}

export const usePersonStore = create<PersonStore>()((set, get) => ({
  people: [],
  loading: false,
  error: null,

  fetchPeople: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch employees with roles
      const { data: profiles, error: profileError } = await supabase
        .from("employees")
        .select("*");

      if (profileError) throw profileError;

      // Map employees to Person type
      const people: Person[] = (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        designation: profile.designation,
        roles: profile.roles || [],
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      }));

      set({ people, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching people:", error);
    }
  },

  addPerson: async (person) => {
    set({ loading: true, error: null });
    try {
      // Insert employee with roles
      const { error: profileError } = await supabase.from("employees").insert({
        name: person.name,
        phone: person.phone,
        designation: person.designation,
        roles: person.roles || [],
      });

      if (profileError) throw profileError;

      // Refresh data
      await get().fetchPeople();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error adding person:", error);
    }
  },

  updatePerson: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      // Update employee
      const profileUpdate: any = {};
      if (updatedData.name) profileUpdate.name = updatedData.name;
      if (updatedData.phone) profileUpdate.phone = updatedData.phone;
      if (updatedData.designation)
        profileUpdate.designation = updatedData.designation;
      if (updatedData.roles !== undefined)
        profileUpdate.roles = updatedData.roles;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from("employees")
          .update(profileUpdate)
          .eq("id", id);

        if (profileError) throw profileError;
      }

      // Refresh data
      await get().fetchPeople();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error updating person:", error);
    }
  },

  deletePerson: async (id) => {
    set({ loading: true, error: null });
    try {
      // Delete employee
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;

      // Refresh data
      await get().fetchPeople();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error deleting person:", error);
    }
  },

  getPerson: (id) => {
    return get().people.find((person) => person.id === id);
  },

  searchPeople: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().people.filter(
      (person) =>
        person.name.toLowerCase().includes(lowerQuery) ||
        person.phone.includes(query) ||
        person.designation.toLowerCase().includes(lowerQuery),
    );
  },
}));
