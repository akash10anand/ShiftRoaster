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
import { Select } from "../components/ui/Select";
import { MultiSelect } from "../components/ui/MultiSelect";
import { Plus, Trash2, X, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { useRosterStore } from "../stores/rosterStore";
import { useShiftTemplateStore } from "../stores/shiftTemplateStore";
import { useRoleStore } from "../stores/roleStore";
import { usePersonStore } from "../stores/personStore";
import { useLeaveStore } from "../stores/leaveStore";
import { RosterShift, RosterShiftRole } from "../types/roster";

export function RosterPlannerPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState<string | null>(null);
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);
  const [rosterFormData, setRosterFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });
  const [showAddShift, setShowAddShift] = useState(false);
  const [shiftFormData, setShiftFormData] = useState({
    templateId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const rosters = useRosterStore((state) => state.rosters);
  const rosterShifts = useRosterStore((state) => state.shifts);
  const rosterLoading = useRosterStore((state) => state.loading);
  const addRoster = useRosterStore((state) => state.addRoster);
  const updateRoster = useRosterStore((state) => state.updateRoster);
  const deleteRoster = useRosterStore((state) => state.deleteRoster);
  const getRoster = useRosterStore((state) => state.getRoster);
  const getRosterShifts = useRosterStore((state) => state.getRosterShifts);
  const addRosterShift = useRosterStore((state) => state.addRosterShift);
  const deleteRosterShift = useRosterStore((state) => state.deleteRosterShift);
  const assignPersonToShiftRole = useRosterStore(
    (state) => state.assignPersonToShiftRole,
  );
  const removePersonFromShiftRole = useRosterStore(
    (state) => state.removePersonFromShiftRole,
  );
  const fetchRosters = useRosterStore((state) => state.fetchRosters);

  const templates = useShiftTemplateStore((state) => state.templates);
  const fetchTemplates = useShiftTemplateStore((state) => state.fetchTemplates);
  const getTemplate = useShiftTemplateStore((state) => state.getTemplate);

  const roles = useRoleStore((state) => state.roles);
  const people = usePersonStore((state) => state.people);
  const getLeavesByPerson = useLeaveStore((state) => state.getLeavesByPerson);

  useEffect(() => {
    fetchRosters();
    fetchTemplates();
  }, [fetchRosters, fetchTemplates]);

  const handleSubmitRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterFormData.name) {
      alert("Roster name is required");
      return;
    }

    try {
      if (editingRosterId) {
        await updateRoster(editingRosterId, {
          name: rosterFormData.name,
          startDate: new Date(rosterFormData.startDate),
          endDate: new Date(rosterFormData.endDate),
        });
        setEditingRosterId(null);
      } else {
        await addRoster({
          name: rosterFormData.name,
          startDate: new Date(rosterFormData.startDate),
          endDate: new Date(rosterFormData.endDate),
        });
      }
      resetRosterForm();
    } catch (error) {
      console.error("Error saving roster:", error);
      alert("Failed to save roster");
    }
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRosterId || !shiftFormData.templateId) {
      alert("Please select template and date");
      return;
    }

    try {
      const template = getTemplate(shiftFormData.templateId);
      if (!template) return;

      await addRosterShift({
        rosterId: selectedRosterId,
        templateId: shiftFormData.templateId,
        date: new Date(shiftFormData.date),
        roles: template.roles.map((role) => ({
          id: Math.random().toString(),
          roleId: role.roleId,
          roleName: role.roleName,
          assignedPersonIds: [],
          requiredCount: role.requiredCount,
        })),
      });
      resetShiftForm();
    } catch (error) {
      console.error("Error adding shift:", error);
      alert("Failed to add shift");
    }
  };

  const handleEditRoster = (rosterId: string) => {
    const roster = getRoster(rosterId);
    if (roster) {
      setRosterFormData({
        name: roster.name,
        startDate: roster.startDate.toISOString().split("T")[0],
        endDate: roster.endDate.toISOString().split("T")[0],
      });
      setEditingRosterId(rosterId);
      setShowForm(true);
    }
  };

  const handleDeleteRoster = async (rosterId: string) => {
    if (confirm("Delete this roster and all its shifts?")) {
      try {
        await deleteRoster(rosterId);
        if (selectedRosterId === rosterId) {
          setSelectedRosterId(null);
        }
      } catch (error) {
        console.error("Error deleting roster:", error);
        alert("Failed to delete roster");
      }
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (confirm("Delete this shift?")) {
      try {
        await deleteRosterShift(shiftId);
      } catch (error) {
        console.error("Error deleting shift:", error);
        alert("Failed to delete shift");
      }
    }
  };

  const handleAssignPerson = async (shiftRoleId: string, personId: string) => {
    try {
      await assignPersonToShiftRole(shiftRoleId, personId);
    } catch (error) {
      console.error("Error assigning person:", error);
      alert("Failed to assign person");
    }
  };

  const handleRemovePerson = async (shiftRoleId: string, personId: string) => {
    try {
      await removePersonFromShiftRole(shiftRoleId, personId);
    } catch (error) {
      console.error("Error removing person:", error);
      alert("Failed to remove person");
    }
  };

  const resetRosterForm = () => {
    setRosterFormData({
      name: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setShowForm(false);
    setEditingRosterId(null);
  };

  const resetShiftForm = () => {
    setShiftFormData({
      templateId: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddShift(false);
  };

  const selectedRoster = selectedRosterId ? getRoster(selectedRosterId) : null;
  const shiftsInRoster = selectedRosterId
    ? getRosterShifts(selectedRosterId)
    : [];

  const getPersonLeaveStatus = (
    personId: string,
    shiftDate: Date,
  ): "on-leave" | "upcoming-leave" | null => {
    const approvedLeaves = getLeavesByPerson(personId).filter(
      (leave) => leave.status === "approved",
    );

    if (approvedLeaves.length === 0) return null;

    const checkDate = new Date(shiftDate);
    checkDate.setHours(0, 0, 0, 0);

    for (const leave of approvedLeaves) {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (startDate <= checkDate && checkDate <= endDate) {
        return "on-leave";
      }
      if (startDate > checkDate) {
        return "upcoming-leave";
      }
    }

    return null;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const getShiftTemplate = (shift: RosterShift) => {
    return getTemplate(shift.templateId);
  };

  if (rosterLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading rosters...</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">
              You need to create Shift Templates first before creating rosters.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Go to Shift Templates to create your shift patterns.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Roster Planner</h1>
        <Button
          onClick={() => {
            resetRosterForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          New Roster
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingRosterId ? "Edit Roster" : "Create New Roster"}
            </CardTitle>
            <button
              onClick={resetRosterForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRoster} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="rosterName">Roster Name</Label>
                  <Input
                    id="rosterName"
                    value={rosterFormData.name}
                    onChange={(e) =>
                      setRosterFormData({
                        ...rosterFormData,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Week of Feb 17-23"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={rosterFormData.startDate}
                    onChange={(e) =>
                      setRosterFormData({
                        ...rosterFormData,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={rosterFormData.endDate}
                    onChange={(e) =>
                      setRosterFormData({
                        ...rosterFormData,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingRosterId ? "Update Roster" : "Create Roster"}
                </Button>
                <Button
                  type="button"
                  onClick={resetRosterForm}
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

      {/* Rosters List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rosters.map((roster) => (
          <Card
            key={roster.id}
            className={`cursor-pointer transition ${
              selectedRosterId === roster.id
                ? "ring-2 ring-blue-500"
                : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedRosterId(roster.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{roster.name}</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(roster.startDate)} to{" "}
                    {formatDate(roster.endDate)}
                  </p>
                </div>
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEditRoster(roster.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteRoster(roster.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {getRosterShifts(roster.id).length} shifts
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Roster Shifts */}
      {selectedRoster && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{selectedRoster.name}</h2>
            <Button
              onClick={() => setShowAddShift(!showAddShift)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add Shift
            </Button>
          </div>

          {showAddShift && (
            <Card>
              <CardHeader>
                <CardTitle>Add Shift to Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddShift} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="templateId">Shift Template</Label>
                      <Select
                        id="templateId"
                        value={shiftFormData.templateId}
                        onChange={(e) =>
                          setShiftFormData({
                            ...shiftFormData,
                            templateId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a template...</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.startTime}-{t.endTime})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shiftDate">Date</Label>
                      <Input
                        id="shiftDate"
                        type="date"
                        value={shiftFormData.date}
                        onChange={(e) =>
                          setShiftFormData({
                            ...shiftFormData,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Add Shift
                    </Button>
                    <Button
                      type="button"
                      onClick={resetShiftForm}
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

          <div className="space-y-4">
            {shiftsInRoster.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No shifts in this roster yet
                </CardContent>
              </Card>
            ) : (
              shiftsInRoster
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((shift) => {
                  const template = getShiftTemplate(shift);
                  return (
                    <Card key={shift.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() =>
                              setExpandedShiftId(
                                expandedShiftId === shift.id ? null : shift.id,
                              )
                            }
                          >
                            <div className="flex items-center gap-2">
                              {expandedShiftId === shift.id ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                              <div>
                                <CardTitle className="text-lg">
                                  {formatDate(shift.date)}
                                </CardTitle>
                                {template && (
                                  <p className="text-sm text-gray-500">
                                    {template.name} ({template.startTime}-
                                    {template.endTime})
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShift(shift.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </CardHeader>

                      {expandedShiftId === shift.id && (
                        <CardContent className="space-y-4 pt-0">
                          {shift.roles.map((role) => {
                            const availablePeople = people.filter(
                              (p) =>
                                !role.assignedPersonIds.includes(p.id) &&
                                p.roles.includes(role.roleId),
                            );

                            return (
                              <div key={role.id} className="rounded border p-4">
                                <div className="mb-3">
                                  <h4 className="font-medium">
                                    {role.roleName}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    Required: {role.requiredCount || 1}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm font-medium mb-2">
                                      Assigned ({role.assignedPersonIds.length})
                                    </p>
                                    {role.assignedPersonIds.length > 0 ? (
                                      <div className="space-y-1">
                                        {role.assignedPersonIds.map(
                                          (personId) => {
                                            const person = people.find(
                                              (p) => p.id === personId,
                                            );
                                            if (!person) return null;

                                            const leaveStatus =
                                              getPersonLeaveStatus(
                                                personId,
                                                shift.date,
                                              );

                                            return (
                                              <div
                                                key={personId}
                                                className={`flex items-center justify-between rounded p-2 text-sm ${
                                                  leaveStatus === "on-leave"
                                                    ? "bg-red-100"
                                                    : leaveStatus ===
                                                        "upcoming-leave"
                                                      ? "bg-yellow-100"
                                                      : "bg-green-100"
                                                }`}
                                              >
                                                <span>
                                                  {person.name}
                                                  {leaveStatus && (
                                                    <span className="ml-2 text-xs font-semibold">
                                                      {leaveStatus ===
                                                      "on-leave"
                                                        ? "ON LEAVE"
                                                        : "UPCOMING LEAVE"}
                                                    </span>
                                                  )}
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    handleRemovePerson(
                                                      role.id,
                                                      personId,
                                                    )
                                                  }
                                                  className="text-red-600 hover:text-red-700"
                                                >
                                                  <X size={16} />
                                                </button>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">
                                        None assigned
                                      </p>
                                    )}
                                  </div>

                                  {availablePeople.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Available
                                      </p>
                                      <div className="space-y-1">
                                        {availablePeople.map((person) => (
                                          <button
                                            key={person.id}
                                            onClick={() =>
                                              handleAssignPerson(
                                                role.id,
                                                person.id,
                                              )
                                            }
                                            className="block w-full rounded bg-blue-50 p-2 text-left text-sm text-blue-600 hover:bg-blue-100"
                                          >
                                            + {person.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      )}
                    </Card>
                  );
                })
            )}
          </div>
        </div>
      )}

      {rosters.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No rosters yet. Create your first roster!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
