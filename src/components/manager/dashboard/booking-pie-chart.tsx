// components/manager/dashboard/booking-pie-chart.tsx
"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type CalendarItem = {
  id: number | string;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  sport?: string;
};

export function BookingPieChart({
  items,
  groupBy = "status",
}: {
  items: CalendarItem[];
  groupBy?: "status" | "sport";
}) {
  const map = new Map<string, number>();

  for (const it of items ?? []) {
    const key =
      groupBy === "sport" ? it.sport ?? "Unknown" : it.status ?? "UNKNOWN";
    map.set(key, (map.get(key) || 0) + 1);
  }

  const data = Array.from(map.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#38bdf8",
    "#a78bfa",
    "#f97316",
    "#14b8a6",
  ];

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold">
          Bookings by {groupBy === "sport" ? "Sport" : "Status"}
        </h3>
        <p className="text-xs text-muted-foreground">
          Distribution of bookings{" "}
          {groupBy === "sport" ? "by sport" : "by status"} in the current window
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v}`, "Bookings"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Total: {items?.length ?? 0} bookings
      </div>
    </Card>
  );
}
