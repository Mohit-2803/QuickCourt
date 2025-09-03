"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarDays, DollarSign, Dumbbell } from "lucide-react";

interface StatsProps {
  stats: {
    totalBookings: number;
    activeCourts: number;
    earnings: number;
    upcoming: number;
  };
}

export function StatsGrid({ stats }: StatsProps) {
  const items = [
    { label: "Total Bookings", value: stats.totalBookings, icon: CalendarDays },
    { label: "Active Courts", value: stats.activeCourts, icon: Dumbbell },
    { label: "Earnings", value: `₹${stats.earnings}`, icon: DollarSign },
    { label: "Upcoming", value: stats.upcoming, icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card
          key={item.label}
          className="rounded-2xl border bg-card text-card-foreground shadow-sm"
        >
          <CardContent className="p-6 flex items-center gap-4">
            <item.icon className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
