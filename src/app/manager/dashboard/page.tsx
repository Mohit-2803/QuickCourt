import { Suspense } from "react";
import { DashboardHeader } from "@/components/manager/dashboard/header";
import { StatsGrid } from "@/components/manager/dashboard/stats-grid";
import { BookingTrends } from "@/components/manager/dashboard/booking-trends";
import { EarningsChart } from "@/components/manager/dashboard/earnings-chart";
import { BookingCalendar } from "@/components/manager/dashboard/booking-calendar";
import { RecentBookings } from "@/components/manager/dashboard/recent-bookings";

export default async function ManagerDashboardPage() {
  // Fetch initial stats from backend (mock for now)
  const stats = {
    totalBookings: 128,
    activeCourts: 6,
    earnings: 54200,
    upcoming: 12,
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
      <DashboardHeader />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          <BookingTrends />
        </Suspense>
        <Suspense
          fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          <EarningsChart />
        </Suspense>
      </div>

      <div>
        <Suspense
          fallback={<div className="h-96 rounded-xl bg-muted animate-pulse" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookingCalendar />
            <RecentBookings />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
