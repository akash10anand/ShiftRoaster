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
import { MultiSelect } from "../components/ui/MultiSelect";
import { AccordionItem } from "../components/ui/Accordion";
import { Plus, Trash2, X, Edit2 } from "lucide-react";
import { useShiftStore } from "../stores/shiftStore";
import { useRoleStore } from "../stores/roleStore";
import { usePersonStore } from "../stores/personStore";
import { useGroupStore } from "../stores/groupStore";
import { useLeaveStore } from "../stores/leaveStore";
import { ShiftRole } from "../types";

export function ShiftPlannerPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
  });

  const shifts = useShiftStore((state) => state.shifts);
  const addShift = useShiftStore((state) => state.addShift);
  const updateShift = useShiftStore((state) => state.updateShift);
  const deleteShift = useShiftStore((state) => state.deleteShift);
  const roles = useRoleStore((state) => state.roles);
  const people = usePersonStore((state) => state.people);
  const groups = useGroupStore((state) => state.groups);
  const isPersonOnLeave = useLeaveStore((state) => state.isPersonOnLeave);
  const getLeavesByPerson = useLeaveStore((state) => state.getLeavesByPerson);

  const getLeaveStatus = (
    personId: string,
  ): {
    status: "current" | "upcoming" | null;
    startDate: Date;
    endDate: Date;
  } | null => {
    const approvedLeaves = getLeavesByPerson(personId).filter(
      (leave) => leave.status === "approved",
    );

    if (approvedLeaves.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const leave of approvedLeaves) {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Check if current (includes today)
      if (startDate <= today && today <= endDate) {
        return { status: "current", startDate, endDate };
      }

      // Check if upcoming
      if (startDate > today) {
        return { status: "upcoming", startDate, endDate };
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShiftId) {
      updateShift(editingShiftId, {
        name: formData.name,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      setEditingShiftId(null);
    } else {
      addShift({
        name: formData.name,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        roles: [],
      });
    }
    setFormData({
      name: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
    });
    setShowForm(false);
  };

  const handleEditShift = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (shift) {
      setFormData({
        name: shift.name,
        date: new Date(shift.date).toISOString().split("T")[0],
        startTime: shift.startTime,
        endTime: shift.endTime,
      });
      setEditingShiftId(shiftId);
      setShowForm(true);
    }
  };

  const assignPersonToRole = (
    shiftId: string,
    roleId: string,
    personId: string,
  ) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const shiftRole = shift.roles.find((r) => r.id === roleId);
    if (!shiftRole) return;

    if (!shiftRole.assignedPersonIds.includes(personId)) {
      shiftRole.assignedPersonIds.push(personId);
      updateShift(shiftId, { roles: shift.roles });
    }
  };

  const removePersonFromRole = (
    shiftId: string,
    roleId: string,
    personId: string,
  ) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const shiftRole = shift.roles.find((r) => r.id === roleId);
    if (!shiftRole) return;

    shiftRole.assignedPersonIds = shiftRole.assignedPersonIds.filter(
      (p) => p !== personId,
    );
    updateShift(shiftId, { roles: shift.roles });
  };

  const addRoleToShift = (shiftId: string, roleId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const newShiftRole: ShiftRole = {
      id: Math.random().toString(36).substr(2, 9),
      roleId,
      roleName: role.name,
      assignedPersonIds: [],
      requiredCount: 1,
    };

    updateShift(shiftId, { roles: [...shift.roles, newShiftRole] });
  };

  const removeRoleFromShift = (shiftId: string, roleId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    updateShift(shiftId, {
      roles: shift.roles.filter((r) => r.id !== roleId),
    });
  };

  const getAvailablePeople = (date: Date) => {
    return people.filter((p) => !isPersonOnLeave(p.id, date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shift Planner</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Shift
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingShiftId ? "Edit Shift" : "Create New Shift"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Shift Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Morning Shift, Evening Shift"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingShiftId ? "Update Shift" : "Create Shift"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingShiftId(null);
                    setFormData({
                      name: "",
                      date: new Date().toISOString().split("T")[0],
                      startTime: "09:00",
                      endTime: "17:00",
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

      {shifts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No shifts created yet. Create your first shift!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {shifts.map((shift) => (
            <Card key={shift.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{shift.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(shift.date).toLocaleDateString()} •{" "}
                      {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditShift(shift.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteShift(shift.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Roles</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedShiftId(shift.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Role
                    </Button>
                  </div>

                  {selectedShiftId === shift.id && (
                    <div className="mb-4 p-3 border border-input rounded-md space-y-2">
                      {roles.map((role) => (
                        <Button
                          key={role.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            addRoleToShift(shift.id, role.id);
                            setSelectedShiftId(null);
                          }}
                        >
                          {role.name}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setSelectedShiftId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {shift.roles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No roles assigned. Add a role to get started.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {shift.roles.map((shiftRole) => (
                          <AccordionItem
                            key={shiftRole.id}
                            title={
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{shiftRole.roleName}</span>
                                <span className="text-sm text-muted-foreground font-normal">
                                  {shiftRole.assignedPersonIds.length} member
                                  {shiftRole.assignedPersonIds.length !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                            }
                            defaultOpen={false}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">
                                  {shiftRole.roleName}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeRoleFromShift(shift.id, shiftRole.id)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Assigned People:
                                </p>
                                {shiftRole.assignedPersonIds.length === 0 ? (
                                  <p className="text-sm text-muted-foreground italic">
                                    No people assigned
                                  </p>
                                ) : (
                                  <div className="space-y-1">
                                    {shiftRole.assignedPersonIds.map(
                                      (personId) => {
                                        const person = people.find(
                                          (p) => p.id === personId,
                                        );
                                        const onLeave = isPersonOnLeave(
                                          personId,
                                          new Date(shift.date),
                                        );
                                        const leaveStatus =
                                          getLeaveStatus(personId);
                                        return person ? (
                                          <div
                                            key={personId}
                                            className={`flex items-center justify-between p-2 rounded text-sm ${
                                              onLeave
                                                ? "bg-yellow-50 border border-yellow-200"
                                                : leaveStatus
                                                  ? "bg-blue-50 border border-blue-200"
                                                  : "bg-secondary/20"
                                            }`}
                                          >
                                            <div className="flex flex-col">
                                              <span>{person.name}</span>
                                              {leaveStatus && (
                                                <span
                                                  className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium max-w-fit ${
                                                    onLeave
                                                      ? "bg-yellow-100 text-yellow-800"
                                                      : "bg-blue-100 text-blue-800"
                                                  }`}
                                                >
                                                  {leaveStatus.status ===
                                                  "current"
                                                    ? "Currently on Leave"
                                                    : "Upcoming Leave"}
                                                  {" • "}
                                                  {new Date(
                                                    leaveStatus.startDate,
                                                  ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                    },
                                                  )}
                                                  {" - "}
                                                  {new Date(
                                                    leaveStatus.endDate,
                                                  ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                    },
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                removePersonFromRole(
                                                  shift.id,
                                                  shiftRole.id,
                                                  personId,
                                                )
                                              }
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ) : null;
                                      },
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Add Person:
                                </p>
                                <MultiSelect
                                  options={getAvailablePeople(
                                    new Date(shift.date),
                                  )
                                    .filter((p) => {
                                      // Filter by role match
                                      const role = roles.find(
                                        (r) => r.id === shiftRole.roleId,
                                      );
                                      return (
                                        !shiftRole.assignedPersonIds.includes(
                                          p.id,
                                        ) &&
                                        (role
                                          ? p.roles.includes(role.id)
                                          : true)
                                      );
                                    })
                                    .map((person) => ({
                                      id: person.id,
                                      label: `${person.name} (${person.designation})`,
                                    }))}
                                  value={shiftRole.assignedPersonIds}
                                  onChange={(personIds) => {
                                    shiftRole.assignedPersonIds = personIds;
                                    updateShift(shift.id, {
                                      roles: shift.roles,
                                    });
                                  }}
                                  placeholder="Select people with this role..."
                                />
                              </div>
                            </div>
                          </AccordionItem>
                        ))}
                      </div>
                    )}
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
