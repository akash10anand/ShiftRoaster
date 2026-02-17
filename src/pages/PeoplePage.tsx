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
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { usePersonStore } from "../stores/personStore";
import { useRoleStore } from "../stores/roleStore";
import { Person } from "../types";

export function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    designation: "",
    roles: [] as string[],
  });

  const people = usePersonStore((state) => state.people);
  const addPerson = usePersonStore((state) => state.addPerson);
  const updatePerson = usePersonStore((state) => state.updatePerson);
  const deletePerson = usePersonStore((state) => state.deletePerson);
  const searchPeople = usePersonStore((state) => state.searchPeople);
  const roles = useRoleStore((state) => state.roles);

  const filteredPeople = searchQuery ? searchPeople(searchQuery) : people;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePerson(editingId, {
        ...formData,
        roles: formData.roles,
      });
      setEditingId(null);
    } else {
      addPerson({
        ...formData,
        roles: formData.roles,
      });
    }
    setFormData({ name: "", phone: "", designation: "", roles: [] });
    setShowForm(false);
  };

  const handleEdit = (person: Person) => {
    setFormData({
      name: person.name,
      phone: person.phone,
      designation: person.designation,
      roles: person.roles,
    });
    setEditingId(person.id);
    setShowForm(true);
  };

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((r) => r !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">People Directory</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Person" : "Add New Person"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter person's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="Enter designation"
                  required
                />
              </div>

              {roles.length > 0 && (
                <div className="space-y-2">
                  <Label>Assign Roles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update Person" : "Add Person"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: "",
                      phone: "",
                      designation: "",
                      roles: [],
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or designation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPeople.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No people found. Add your first person to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPeople.map((person) => (
            <Card key={person.id}>
              <CardContent className="pt-6 px-6 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {person.designation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {person.phone}
                    </p>
                    {person.roles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {person.roles.map((roleId) => {
                          const role = roles.find((r) => r.id === roleId);
                          return (
                            <span
                              key={roleId}
                              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                            >
                              {role?.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(person)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePerson(person.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
