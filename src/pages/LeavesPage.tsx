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
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Plus, Trash2, Check, X } from "lucide-react";
import { useLeaveStore } from "../stores/leaveStore";
import { usePersonStore } from "../stores/personStore";

export function LeavesPage() {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [formData, setFormData] = useState({
    personId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const leaves = useLeaveStore((state) => state.leaves);
  const addLeave = useLeaveStore((state) => state.addLeave);
  const deleteLeave = useLeaveStore((state) => state.deleteLeave);
  const approveLeave = useLeaveStore((state) => state.approveLeave);
  const rejectLeave = useLeaveStore((state) => state.rejectLeave);
  const people = usePersonStore((state) => state.people);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLeave({
      personId: formData.personId,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      reason: formData.reason,
      status: "pending",
    });
    setFormData({
      personId: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setShowForm(false);
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (filterStatus === "all") return true;
    return leave.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPersonName = (personId: string) => {
    return people.find((p) => p.id === personId)?.name || "Unknown Person";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request New Leave</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Person</Label>
                <Select
                  value={formData.personId}
                  onChange={(e) =>
                    setFormData({ ...formData, personId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.designation}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Reason for leave"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Request Leave</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      personId: "",
                      startDate: "",
                      endDate: "",
                      reason: "",
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

      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => setFilterStatus(status as any)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {filteredLeaves.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No leave requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => (
            <Card key={leave.id}>
              <CardContent className="pt-6 px-6 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {getPersonName(leave.personId)}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(
                          leave.status,
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(leave.startDate).toLocaleDateString()} to{" "}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm">{leave.reason}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {leave.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveLeave(leave.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectLeave(leave.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLeave(leave.id)}
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
