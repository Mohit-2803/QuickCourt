// app/bookings/page.tsx
import { Suspense } from "react";
import BookingsTable from "@/components/manager/bookings/bookings-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Player Bookings",
  description: "Manage player bookings at your venues.",
};

export default function BookingsPage() {
  // Demo counts for header
  const totals = { all: 58, confirmed: 32, pending: 18, cancelled: 8 };

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
      <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">
            Player Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground font-medium">
          All: {totals.all} | Confirmed: {totals.confirmed} | Pending:{" "}
          {totals.pending} | Cancelled: {totals.cancelled}
        </CardContent>
      </Card>

      <Suspense
        fallback={<div className="h-32 rounded-xl bg-muted animate-pulse" />}
      >
        <BookingsTable />
      </Suspense>
    </div>
  );
}
