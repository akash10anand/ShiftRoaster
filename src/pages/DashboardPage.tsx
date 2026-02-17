import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";
import { usePersonStore } from "../stores/personStore";
import { useRoleStore } from "../stores/roleStore";
import { useGroupStore } from "../stores/groupStore";
import { useShiftStore } from "../stores/shiftStore";
import { useLeaveStore } from "../stores/leaveStore";

export function DashboardPage() {
  const people = usePersonStore((state) => state.people);
  const roles = useRoleStore((state) => state.roles);
  const groups = useGroupStore((state) => state.groups);
  const shifts = useShiftStore((state) => state.shifts);
  const leaves = useLeaveStore((state) => state.leaves);

  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;

  const stats = [
    {
      title: "Total People",
      value: people.length,
      color: "bg-blue-500",
    },
    {
      title: "Total Roles",
      value: roles.length,
      color: "bg-green-500",
    },
    {
      title: "Total Groups",
      value: groups.length,
      color: "bg-purple-500",
    },
    {
      title: "Active Shifts",
      value: shifts.length,
      color: "bg-orange-500",
    },
    {
      title: "People On Leave",
      value: approvedLeaves,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Shift Roaster Management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`${stat.color} w-12 h-12 rounded-lg opacity-20`}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-6 pb-6">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add New Person
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add New Role
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Create New Shift
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Shift Roaster</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-sm text-muted-foreground">
              Manage your team's shifts efficiently with our intuitive roaster
              planner. Create roles, organize people into groups, plan shifts,
              and manage leaves all in one place.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
