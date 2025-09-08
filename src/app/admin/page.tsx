import { getAdminMetrics } from "@/app/actions/admin/get-metrics";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, CalendarCheck2, IndianRupee } from "lucide-react";
import AdminQuickFilter from "@/components/admin/AdminQuickFilter";
import RevenueBarChart from "@/components/admin/Revenue-bar-chart";
import BookingTrendChart from "@/components/admin/Booking-trend-chart";

export const metadata = {
  title: "Admin Dashboard",
  description: "Platform overview and controls.",
};

export default async function AdminDashboardPage() {
  const data = await getAdminMetrics();

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">Admin Dashboard</h1>
        <AdminQuickFilter />
      </div>

      {/* KPIs (server-rendered) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Users" value={data.kpi.totalUsers} />
        <StatCard
          icon={Building2}
          label="Venues"
          value={data.kpi.totalVenues}
        />
        <StatCard
          icon={CalendarCheck2}
          label="Bookings"
          value={data.kpi.totalBookings}
        />
        <StatCard
          icon={IndianRupee}
          label="Earnings (₹)"
          value={data.kpi.earnings}
        />
      </div>

      {/* Charts (client islands) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingTrendChart data={data.bookingTrend} />
        <RevenueBarChart data={data.revenueByMonth} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">
            {value.toLocaleString("en-IN")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
