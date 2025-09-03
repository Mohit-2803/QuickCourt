"use client";

import { useAuth } from "@/hooks/use-auth";

export function DashboardHeader() {
  const { user } = useAuth();

  const displayName =
    user?.name?.trim().toUpperCase() || user?.email?.split("@") || "Guest";

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manage your facility
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {displayName}
          {user?.email && user?.name && ` • ${user.email}`}
        </p>
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        Manage bookings, courts, and earnings.
      </p>
    </div>
  );
}
