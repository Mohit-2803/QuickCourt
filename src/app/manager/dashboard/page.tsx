import { Suspense } from "react";
import { DashboardHeader } from "@/components/manager/dashboard/header";
import { StatsGrid } from "@/components/manager/dashboard/stats-grid";
import { BookingTrends } from "@/components/manager/dashboard/booking-trends";
import { EarningsChart } from "@/components/manager/dashboard/earnings-chart";
import { BookingCalendar } from "@/components/manager/dashboard/booking-calendar";
import { RecentBookings } from "@/components/manager/dashboard/recent-bookings";
import { getManagerDashboardData } from "@/app/actions/manager/dashboard-actions";

export const metadata = {
  title: "Dashboard",
  description: "Overview of your sports venue management.",
};

export default async function ManagerDashboardPage() {
  const data = await getManagerDashboardData();

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
      <DashboardHeader />

      <StatsGrid stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          <BookingTrends data={data.trends} />
        </Suspense>
        <Suspense
          fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          <EarningsChart data={data.earnings} />
        </Suspense>
      </div>

      <div>
        <Suspense
          fallback={<div className="h-96 rounded-xl bg-muted animate-pulse" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookingCalendar items={data.calendar} />
            <RecentBookings items={data.recent} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
