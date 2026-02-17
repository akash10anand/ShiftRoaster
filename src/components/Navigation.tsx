import React from "react";
import {
  Users,
  Briefcase,
  Users2,
  Calendar,
  Clock,
  Home,
  LogOut,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
  { id: "people", label: "People", icon: <Users className="h-5 w-5" /> },
  { id: "roles", label: "Roles", icon: <Briefcase className="h-5 w-5" /> },
  { id: "groups", label: "Groups", icon: <Users2 className="h-5 w-5" /> },
  {
    id: "shift-templates",
    label: "Templates",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    id: "roster-planner",
    label: "Roster",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "shift-planner",
    label: "Shifts (Legacy)",
    icon: <Calendar className="h-5 w-5" />,
  },
  { id: "leaves", label: "Leaves", icon: <Clock className="h-5 w-5" /> },
];

interface NavigationProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="bg-card border-b border-border h-16 flex items-center overflow-x-auto">
      <div className="flex gap-1 px-4 overflow-x-auto flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap transition-all active:scale-95 ${
              currentPage === item.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent active:bg-accent/80"
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline text-sm font-medium">
              {item.label}
            </span>
            <span className="sm:hidden text-sm font-medium">
              {item.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-4 border-l border-border">
        <span className="hidden md:inline text-sm text-muted-foreground">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground hover:bg-accent active:bg-accent/80 transition-all active:scale-95"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
