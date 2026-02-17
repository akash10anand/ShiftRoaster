import { create } from "zustand";
import { Leave } from "../types";
import { supabase } from "../lib/supabase";

interface LeaveStore {
  leaves: Leave[];
  loading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  addLeave: (
    leave: Omit<Leave, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateLeave: (id: string, leave: Partial<Leave>) => Promise<void>;
  deleteLeave: (id: string) => Promise<void>;
  getLeave: (id: string) => Leave | undefined;
  getLeavesByPerson: (personId: string) => Leave[];
  isPersonOnLeave: (personId: string, date: Date) => boolean;
  approveLeave: (id: string) => Promise<void>;
  rejectLeave: (id: string) => Promise<void>;
}

export const useLeaveStore = create<LeaveStore>()((set, get) => ({
  leaves: [],
  loading: false,
  error: null,

  fetchLeaves: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("leaves")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;

      const leaves: Leave[] = (data || []).map((leave) => ({
        id: leave.id,
        personId: leave.person_id,
        startDate: new Date(leave.start_date),
        endDate: new Date(leave.end_date),
        reason: leave.reason,
        status: leave.status as "pending" | "approved" | "rejected",
        createdAt: new Date(leave.created_at),
        updatedAt: new Date(leave.updated_at),
      }));

      set({ leaves, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching leaves:", error);
    }
  },

  addLeave: async (leave) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("leaves").insert({
        person_id: leave.personId,
        start_date: leave.startDate,
        end_date: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      });

      if (error) throw error;

      await get().fetchLeaves();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error adding leave:", error);
    }
  },

  updateLeave: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};
      if (updatedData.personId) updateData.person_id = updatedData.personId;
      if (updatedData.startDate) updateData.start_date = updatedData.startDate;
      if (updatedData.endDate) updateData.end_date = updatedData.endDate;
      if (updatedData.reason) updateData.reason = updatedData.reason;
      if (updatedData.status) updateData.status = updatedData.status;

      const { error } = await supabase
        .from("leaves")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await get().fetchLeaves();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error updating leave:", error);
    }
  },

  deleteLeave: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("leaves").delete().eq("id", id);

      if (error) throw error;

      await get().fetchLeaves();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error deleting leave:", error);
    }
  },

  getLeave: (id) => {
    return get().leaves.find((leave) => leave.id === id);
  },

  getLeavesByPerson: (personId) => {
    return get().leaves.filter((leave) => leave.personId === personId);
  },

  isPersonOnLeave: (personId, date) => {
    const targetDate = new Date(date);
    return get().leaves.some((leave) => {
      if (leave.personId !== personId || leave.status !== "approved") {
        return false;
      }
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return targetDate >= startDate && targetDate <= endDate;
    });
  },

  approveLeave: async (id) => {
    await get().updateLeave(id, { status: "approved" });
  },

  rejectLeave: async (id) => {
    await get().updateLeave(id, { status: "rejected" });
  },
}));
