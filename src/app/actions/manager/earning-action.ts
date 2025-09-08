"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type EarningsKPI = {
  gross: number; // major units (INR)
  platformFees: number; // major units
  net: number; // major units
  payouts: number; // optional if tracking payouts
};

export type EarningPoint = { date: string; net: number }; // daily
export type EarningMonth = {
  month: string;
  gross: number;
  platformFees: number;
  net: number;
};

export type EarningsData = {
  kpi: EarningsKPI;
  daily: EarningPoint[];
  monthly: EarningMonth[];
};

const PLATFORM_FEE_PCT = Number(process.env.PLATFORM_FEE_PCT ?? "10"); // fallback 10%

export async function getUserEarnings(): Promise<EarningsData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      kpi: { gross: 0, platformFees: 0, net: 0, payouts: 0 },
      daily: [],
      monthly: [],
    };
  }

  // Identify earnings owned by this user. If “provider/owner”:
  // Payments from bookings where the venue owner userId = current user id.
  // If the page is for players’ spend/refunds instead, change the where to booking.userId.
  const ownerUserId = Number(session.user.id);

  // Fetch succeeded payments in recent window (e.g., last 180 days) to limit payload
  const now = new Date();
  const startWindow = new Date(now);
  startWindow.setDate(now.getDate() - 180);

  const payments = await prisma.payment.findMany({
    where: {
      status: "SUCCEEDED",
      booking: {
        status: "CONFIRMED",
        court: {
          venue: {
            owner: { userId: ownerUserId },
          },
        },
      },
      createdAt: { gte: startWindow },
    },
    select: {
      amount: true, // minor units
      createdAt: true,
      // If stored:
      // applicationFeeAmount: true,
      // platformFee: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate
  let grossMinor = 0;
  let platformMinor = 0;

  // Prepare daily buckets
  const dayFmt = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dailyMap = new Map<string, number>();

  // Prepare monthly buckets
  const monFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });
  const monthlyMap = new Map<string, { gross: number; platform: number }>();

  for (const p of payments) {
    const amt = p.amount ?? 0;
    grossMinor += amt;

    // Platform fee: prefer stored fee, else compute percentage
    // const pf = p.platformFee ?? p.applicationFeeAmount ?? Math.round((amt * PLATFORM_FEE_PCT) / 100);
    const pf = Math.round((amt * PLATFORM_FEE_PCT) / 100);
    platformMinor += pf;

    const dayKey = dayFmt.format(p.createdAt); // DD/MM/YYYY
    const monKey = monFmt.format(p.createdAt); // e.g., "Sep 2025"

    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + (amt - pf));
    const mon = monthlyMap.get(monKey) || { gross: 0, platform: 0 };
    mon.gross += amt;
    mon.platform += pf;
    monthlyMap.set(monKey, mon);
  }

  const netMinor = grossMinor - platformMinor;

  // Build series outputs
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

  // KPIs in major units
  const kpi: EarningsKPI = {
    gross: Math.round(grossMinor / 100),
    platformFees: Math.round(platformMinor / 100),
    net: Math.round(netMinor / 100),
    payouts: 0, // populate if you track payouts table
  };

  return { kpi, daily, monthly };
}
