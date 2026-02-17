import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useGroupStore } from "../stores/groupStore";
import { usePersonStore } from "../stores/personStore";
import { Group } from "../types";

export function GroupsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personIds: [] as string[],
  });

  const groups = useGroupStore((state) => state.groups);
  const addGroup = useGroupStore((state) => state.addGroup);
  const updateGroup = useGroupStore((state) => state.updateGroup);
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const people = usePersonStore((state) => state.people);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateGroup(editingId, formData);
      setEditingId(null);
    } else {
      addGroup(formData);
    }
    setFormData({ name: "", description: "", personIds: [] });
    setShowForm(false);
  };

  const handleEdit = (group: Group) => {
    setFormData({
      name: group.name,
      description: group.description || "",
      personIds: group.personIds,
    });
    setEditingId(group.id);
    setShowForm(true);
  };

  const togglePerson = (personId: string) => {
    setFormData((prev) => ({
      ...prev,
      personIds: prev.personIds.includes(personId)
        ? prev.personIds.filter((p) => p !== personId)
        : [...prev.personIds, personId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Group Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Group" : "Create New Group"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Team A, Shift Group 1, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the group"
                />
              </div>

              {people.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Members</Label>
                  <div className="max-h-60 overflow-y-auto border border-input rounded-md p-3 space-y-2">
                    {people.map((person) => (
                      <label
                        key={person.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.personIds.includes(person.id)}
                          onChange={() => togglePerson(person.id)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">
                            {person.name}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {person.designation}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {formData.personIds.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formData.personIds.length} member(s) selected
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update Group" : "Create Group"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", description: "", personIds: [] });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No groups created yet. Create your first group!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {group.personIds.length} members
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                {group.personIds.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Members:</p>
                    <div className="space-y-1">
                      {group.personIds.map((personId) => {
                        const person = people.find((p) => p.id === personId);
                        return person ? (
                          <div key={personId} className="text-sm">
                            <span className="font-medium">{person.name}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              - {person.designation}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(group)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
