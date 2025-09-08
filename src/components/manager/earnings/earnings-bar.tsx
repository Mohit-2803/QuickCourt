"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function EarningsBarChart({
  data,
}: {
  data: { month: string; gross: number; platformFees: number; net: number }[];
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Monthly Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="gross"
                fill="#1763bf"
                name="Gross"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="platformFees"
                fill="#f59e0b"
                name="Platform Fees"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="net"
                fill="#16a34a"
                name="Net"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
