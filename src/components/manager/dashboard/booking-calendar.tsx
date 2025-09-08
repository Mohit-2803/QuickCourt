"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function BookingCalendar({
  items,
}: {
  items: {
    id: number;
    title: string;
    start: string;
    end: string;
    status: "CONFIRMED" | "PENDING" | "CANCELLED";
  }[];
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Booking Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
