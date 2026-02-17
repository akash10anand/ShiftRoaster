import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { DashboardPage } from "./pages/DashboardPage";
import { PeoplePage } from "./pages/PeoplePage";
import { RolesPage } from "./pages/RolesPage";
import { GroupsPage } from "./pages/GroupsPage";
import { ShiftPlannerPage } from "./pages/ShiftPlannerPage";
import { ShiftTemplatesPage } from "./pages/ShiftTemplatesPage";
import { RosterPlannerPage } from "./pages/RosterPlannerPage";
import { LeavesPage } from "./pages/LeavesPage";
import { AuthPage } from "./pages/AuthPage";
import { useAuth } from "./contexts/AuthContext";
import { useInitializeStores } from "./hooks/useInitializeStores";
import "./index.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, loading } = useAuth();

  // Initialize all stores with data from Supabase (only when authenticated)
  useInitializeStores();

  useEffect(() => {
    // Register service worker for PWA support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
    }
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "people":
        return <PeoplePage />;
      case "roles":
        return <RolesPage />;
      case "groups":
        return <GroupsPage />;
      case "shift-planner":
        return <ShiftPlannerPage />;
      case "shift-templates":
        return <ShiftTemplatesPage />;
      case "roster-planner":
        return <RosterPlannerPage />;
      case "leaves":
        return <LeavesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
