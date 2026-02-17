import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { MultiSelect } from "../components/ui/MultiSelect";
import { Plus, Trash2, X, Edit2 } from "lucide-react";
import { useShiftTemplateStore } from "../stores/shiftTemplateStore";
import { useRoleStore } from "../stores/roleStore";
import { ShiftTemplateRole } from "../types/roster";

export function ShiftTemplatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
  });
  const [selectedRoles, setSelectedRoles] = useState<ShiftTemplateRole[]>([]);

  const templates = useShiftTemplateStore((state) => state.templates);
  const loading = useShiftTemplateStore((state) => state.loading);
  const addTemplate = useShiftTemplateStore((state) => state.addTemplate);
  const updateTemplate = useShiftTemplateStore((state) => state.updateTemplate);
  const deleteTemplate = useShiftTemplateStore((state) => state.deleteTemplate);
  const fetchTemplates = useShiftTemplateStore((state) => state.fetchTemplates);
  const getTemplate = useShiftTemplateStore((state) => state.getTemplate);

  const roles = useRoleStore((state) => state.roles);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Template name is required");
      return;
    }

    try {
      if (editingId) {
        await updateTemplate(editingId, {
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          roles: selectedRoles,
        });
        setEditingId(null);
      } else {
        await addTemplate({
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          roles: selectedRoles,
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    }
  };

  const handleEdit = (templateId: string) => {
    const template = getTemplate(templateId);
    if (template) {
      setFormData({
        name: template.name,
        startTime: template.startTime,
        endTime: template.endTime,
      });
      setSelectedRoles(template.roles);
      setEditingId(templateId);
      setShowForm(true);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (confirm("Delete this shift template?")) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error("Error deleting template:", error);
        alert("Failed to delete template");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "09:00",
      endTime: "17:00",
    });
    setSelectedRoles([]);
    setShowForm(false);
    setEditingId(null);
  };

  const addRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role && !selectedRoles.find((sr) => sr.roleId === roleId)) {
      setSelectedRoles([
        ...selectedRoles,
        {
          id: Math.random().toString(),
          roleId: role.id,
          roleName: role.name,
          requiredCount: 1,
        },
      ]);
      setShowAddRole(false);
    }
  };

  const removeRole = (roleId: string) => {
    setSelectedRoles(selectedRoles.filter((sr) => sr.roleId !== roleId));
  };

  const updateRoleCount = (roleId: string, count: number) => {
    setSelectedRoles(
      selectedRoles.map((sr) =>
        sr.roleId === roleId ? { ...sr, requiredCount: count } : sr,
      ),
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Loading shift templates...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shift Templates</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          New Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId ? "Edit Shift Template" : "Create New Shift Template"}
            </CardTitle>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Morning Shift"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Roles in this Template</Label>
                <div className="mt-2 space-y-2">
                  {selectedRoles.map((role) => (
                    <div
                      key={role.roleId}
                      className="flex items-center justify-between rounded bg-gray-100 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.roleName}</span>
                        <span className="text-sm text-gray-500">
                          Required: {role.requiredCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={role.requiredCount || 1}
                          onChange={(e) =>
                            updateRoleCount(
                              role.roleId,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-16"
                        />
                        <button
                          type="button"
                          onClick={() => removeRole(role.roleId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {!showAddRole ? (
                  <Button
                    type="button"
                    onClick={() => setShowAddRole(true)}
                    className="mt-2"
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Role
                  </Button>
                ) : (
                  <div className="mt-2 space-y-2">
                    <MultiSelect
                      options={roles
                        .filter(
                          (r) =>
                            !selectedRoles.find((sr) => sr.roleId === r.id),
                        )
                        .map((r) => ({
                          id: r.id,
                          label: r.name,
                        }))}
                      value={[]}
                      onChange={(selectedIds) => {
                        selectedIds.forEach((roleId) => addRole(roleId));
                      }}
                      placeholder="Select role to add"
                    />
                    <Button
                      type="button"
                      onClick={() => setShowAddRole(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Update Template" : "Create Template"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {template.startTime} - {template.endTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Roles:</p>
                {template.roles.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {template.roles.map((role) => (
                      <li key={role.roleId} className="text-sm text-gray-600">
                        • {role.roleName} (x{role.requiredCount || 1})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No roles defined</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No shift templates yet. Create your first one!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
