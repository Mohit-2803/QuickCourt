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

      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Insights & Suggestions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Month-over-Month</p>
            <p className="mt-2 text-sm">
              {data.trend.momPct >= 0
                ? `Up ${data.trend.momPct.toFixed(1)}% vs last month`
                : `Down ${Math.abs(data.trend.momPct).toFixed(
                    1
                  )}% vs last month`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Last month: ₹{data.trend.prevMonth.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Payout Readiness</p>
            <p className="mt-2 text-sm">
              Eligible: ₹{data.insights.payoutEligible.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Next window: {data.insights.nextPayoutWindow}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Fees Ratio</p>
            <p className="mt-2 text-sm">
              {data.kpi.gross > 0
                ? `${((data.kpi.platformFees / data.kpi.gross) * 100).toFixed(
                    1
                  )}% of gross`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fees: ₹{data.kpi.platformFees.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Top Performer</p>
            <p className="mt-2 text-sm">
              {data.insights.top?.label
                ? `${
                    data.insights.top.label
                  } • ₹${data.insights.top.amount.toLocaleString("en-IN")}`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Best revenue source this period
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm font-medium">Suggestion</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Enable off‑peak discounts on low‑demand slots to raise utilization
              and steady net earnings.
            </p>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm font-medium">Suggestion</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reconcile monthly statements: keep gross, fees, and payouts
              aligned for clean bookkeeping.
            </p>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm font-medium">Suggestion</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fees ratio looks healthy; maintain pricing and promote multi‑hour
              or bundle bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
