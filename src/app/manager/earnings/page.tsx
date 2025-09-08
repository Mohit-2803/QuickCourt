import { Suspense } from "react";
import { TrendingUp, Wallet, Percent, ArrowDownToLine } from "lucide-react";
import { getUserEarnings } from "@/app/actions/manager/earning-action";
import { EarningsBarChart } from "@/components/manager/earnings/earnings-bar";
import { EarningsLineChart } from "@/components/manager/earnings/earnings-line";
import { StatCard } from "@/components/manager/earnings/earnings-statcard";

export default async function EarningsPage() {
  const data = await getUserEarnings();

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">Earnings</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="p-5 flex items-center gap-4 py-8">
            <TrendingUp className="h-10 w-10 text-muted-foreground" />
            <StatCard label="Net Earnings" value={data.kpi.net} />
          </div>
        </div>

        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="p-5 flex items-center gap-4 py-8">
            <Wallet className="h-10 w-10 text-muted-foreground" />
            <StatCard label="Gross" value={data.kpi.gross} />
          </div>
        </div>

        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="p-5 flex items-center gap-4 py-8">
            <Percent className="h-10 w-10 text-muted-foreground" />
            <StatCard label="Platform Fees" value={data.kpi.platformFees} />
          </div>
        </div>

        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="p-5 flex items-center gap-4 py-8">
            <ArrowDownToLine className="h-10 w-10 text-muted-foreground" />
            <StatCard label="Payouts" value={data.kpi.payouts} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          <EarningsLineChart data={data.daily} />
        </Suspense>
        <Suspense
          fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          <EarningsBarChart data={data.monthly} />
        </Suspense>
      </div>
    </div>
  );
}
