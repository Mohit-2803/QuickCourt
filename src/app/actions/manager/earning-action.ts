"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type EarningsKPI = {
  gross: number; // major units (INR)
  platformFees: number; // major units
  net: number; // major units
  payouts: number; // major units (0 if not tracked)
};

export type EarningPoint = { date: string; net: number }; // daily

export type EarningMonth = {
  month: string;
  gross: number;
  platformFees: number;
  net: number;
};

export type EarningsTrend = {
  momPct: number;
  prevMonth: number;
};

export type EarningsTop = {
  label: string;
  amount: number;
} | null;

export type EarningsInsights = {
  payoutEligible: number;
  nextPayoutWindow: string;
  top: EarningsTop;
};

export type EarningsData = {
  kpi: EarningsKPI;
  daily: EarningPoint[];
  monthly: EarningMonth[];
  trend: EarningsTrend;
  insights: EarningsInsights;
  actions?: {
    exportCsv?: () => Promise<void>;
    requestPayout?: () => Promise<void>;
  };
};

const PLATFORM_FEE_PCT = Number(process.env.PLATFORM_FEE_PCT ?? "10"); // %

export async function getUserEarnings(): Promise<EarningsData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      kpi: { gross: 0, platformFees: 0, net: 0, payouts: 0 },
      daily: [],
      monthly: [],
      trend: { momPct: 0, prevMonth: 0 },
      insights: { payoutEligible: 0, nextPayoutWindow: "—", top: null },
    };
  }

  const ownerUserId = Number(session.user.id);

  const now = new Date();
  const startWindow = new Date(now);
  startWindow.setDate(now.getDate() - 180);

  const payments = await prisma.payment.findMany({
    where: {
      status: "SUCCEEDED",
      booking: {
        status: "CONFIRMED",
        court: { venue: { owner: { userId: ownerUserId } } },
      },
      createdAt: { gte: startWindow },
    },
    select: {
      amount: true, // minor (paise)
      createdAt: true,
      // applicationFeeAmount: true,
      // platformFee: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let grossMinor = 0;
  let platformMinor = 0;

  const dayFmt = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const monFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });

  const dailyMap = new Map<string, number>(); // net minor
  const monthlyMap = new Map<string, { gross: number; platform: number }>(); // minors
  const monthlyNetMinor = new Map<string, number>();

  for (const p of payments) {
    const amt = p.amount ?? 0;
    grossMinor += amt;

    const pf = Math.round((amt * PLATFORM_FEE_PCT) / 100);
    platformMinor += pf;

    const dayKey = dayFmt.format(p.createdAt);
    const monKey = monFmt.format(p.createdAt);

    const netMinor = amt - pf;

    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + netMinor);

    const mon = monthlyMap.get(monKey) || { gross: 0, platform: 0 };
    mon.gross += amt;
    mon.platform += pf;
    monthlyMap.set(monKey, mon);

    monthlyNetMinor.set(monKey, (monthlyNetMinor.get(monKey) || 0) + netMinor);
  }

  const netMinor = grossMinor - platformMinor;

  const daily: EarningPoint[] = Array.from(dailyMap.entries()).map(
    ([date, net]) => ({
      date,
      net: Math.round(net / 100),
    })
  );

  const monthly: EarningMonth[] = Array.from(monthlyMap.entries()).map(
    ([month, v]) => ({
      month,
      gross: Math.round(v.gross / 100),
      platformFees: Math.round(v.platform / 100),
      net: Math.round((v.gross - v.platform) / 100),
    })
  );

  const monthOrder = Array.from(monthlyNetMinor.keys()).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return da.getTime() - db.getTime();
  });
  const lastMonthKey = monthOrder[monthOrder.length - 1];
  const prevMonthKey = monthOrder[monthOrder.length - 2];

  const lastNet = lastMonthKey ? monthlyNetMinor.get(lastMonthKey)! / 100 : 0;
  const prevNet = prevMonthKey ? monthlyNetMinor.get(prevMonthKey)! / 100 : 0;

  const momPct = prevNet > 0 ? ((lastNet - prevNet) / prevNet) * 100 : 0;

  // Top performer: pick the month with highest net
  let top: EarningsTop = null;
  if (monthOrder.length > 0) {
    let bestKey = monthOrder[0];
    for (const k of monthOrder) {
      if ((monthlyNetMinor.get(k) || 0) > (monthlyNetMinor.get(bestKey) || 0))
        bestKey = k;
    }
    top = {
      label: bestKey,
      amount: Math.round((monthlyNetMinor.get(bestKey) || 0) / 100),
    };
  }

  const kpi: EarningsKPI = {
    gross: Math.round(grossMinor / 100),
    platformFees: Math.round(platformMinor / 100),
    net: Math.round(netMinor / 100),
    payouts: 0,
  };

  const nextFriday = (() => {
    const d = new Date();
    const day = d.getDay(); // 0 Sun ... 6 Sat
    const diff = (5 - day + 7) % 7 || 7; // days to next Friday
    d.setDate(d.getDate() + diff);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  })();

  const insights: EarningsInsights = {
    payoutEligible: kpi.net,
    nextPayoutWindow: nextFriday,
    top,
  };

  const trend: EarningsTrend = {
    momPct,
    prevMonth: prevNet,
  };

  return { kpi, daily, monthly, trend, insights };
}
