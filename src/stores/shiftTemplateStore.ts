import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ShiftTemplate, ShiftTemplateRole } from "../types/roster";
import { supabase } from "../lib/supabase";

interface ShiftTemplateStore {
  templates: ShiftTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  addTemplate: (
    template: Omit<ShiftTemplate, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateTemplate: (
    id: string,
    template: Partial<ShiftTemplate>,
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => ShiftTemplate | undefined;
}

export const useShiftTemplateStore = create<ShiftTemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      loading: false,
      error: null,

      fetchTemplates: async () => {
        set({ loading: true, error: null });
        try {
          // Fetch templates
          const { data: templatesData, error: templatesError } = await supabase
            .from("shift_templates")
            .select("*")
            .order("name", { ascending: true });

          if (templatesError) throw templatesError;

          // Fetch template roles with role info
          const { data: templateRolesData, error: rolesError } = await supabase
            .from("shift_template_roles")
            .select("*, roles(id, name)");

          if (rolesError) throw rolesError;

          const templates: ShiftTemplate[] = (templatesData || []).map(
            (template) => {
              // Get template roles for this template
              const templateRoles = (templateRolesData || [])
                .filter((tr) => tr.template_id === template.id)
                .map((tr) => ({
                  id: tr.id,
                  roleId: tr.role_id,
                  roleName: tr.roles?.name || "",
                  requiredCount: tr.required_count,
                }));

              return {
                id: template.id,
                name: template.name,
                startTime: template.start_time,
                endTime: template.end_time,
                roles: templateRoles,
                createdAt: new Date(template.created_at),
                updatedAt: new Date(template.updated_at),
              };
            },
          );

          set({ templates, loading: false });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch templates";
          set({ error: message, loading: false });
          console.error("Error fetching templates:", error);
        }
      },

      addTemplate: async (template) => {
        try {
          // Insert template
          const { data: newTemplate, error: insertError } = await supabase
            .from("shift_templates")
            .insert({
              name: template.name,
              start_time: template.startTime,
              end_time: template.endTime,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Insert template roles
          if (template.roles.length > 0) {
            const rolesData = template.roles.map((role) => ({
              template_id: newTemplate.id,
              role_id: role.roleId,
              required_count: role.requiredCount || 1,
            }));

            const { error: rolesInsertError } = await supabase
              .from("shift_template_roles")
              .insert(rolesData);

            if (rolesInsertError) throw rolesInsertError;
          }

          // Refresh templates list
          await get().fetchTemplates();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to add template";
          set({ error: message });
          throw error;
        }
      },

      updateTemplate: async (id, updates) => {
        try {
          // Update template basic info
          const { error: updateError } = await supabase
            .from("shift_templates")
            .update({
              name: updates.name,
              start_time: updates.startTime,
              end_time: updates.endTime,
            })
            .eq("id", id);

          if (updateError) throw updateError;

          // If updating roles, delete old and insert new
          if (updates.roles) {
            const { error: deleteError } = await supabase
              .from("shift_template_roles")
              .delete()
              .eq("template_id", id);

            if (deleteError) throw deleteError;

            if (updates.roles.length > 0) {
              const rolesData = updates.roles.map((role) => ({
                template_id: id,
                role_id: role.roleId,
                required_count: role.requiredCount || 1,
              }));

              const { error: rolesInsertError } = await supabase
                .from("shift_template_roles")
                .insert(rolesData);

              if (rolesInsertError) throw rolesInsertError;
            }
          }

          // Refresh templates list
          await get().fetchTemplates();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update template";
          set({ error: message });
          throw error;
        }
      },

      deleteTemplate: async (id) => {
        try {
          const { error } = await supabase
            .from("shift_templates")
            .delete()
            .eq("id", id);

          if (error) throw error;

          // Refresh templates list
          await get().fetchTemplates();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete template";
          set({ error: message });
          throw error;
        }
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },
    }),
    {
      name: "shift-template-store",
    },
  ),
);
