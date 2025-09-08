"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AdminKpi = {
  totalUsers: number;
  totalVenues: number;
  totalBookings: number;
  earnings: number; // INR major
};

export type TrendPoint = { label: string; value: number };

export type AdminMetrics = {
  kpi: AdminKpi;
  bookingTrend: TrendPoint[];
  revenueByMonth: TrendPoint[];
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [totalUsers, totalVenues, totalBookings] = await Promise.all([
    prisma.user.count(),
    prisma.venue.count(),
    prisma.booking.count(),
  ]);

  const agg = await prisma.payment.aggregate({
    where: { status: "SUCCEEDED" },
    _sum: { amount: true },
  });
  const earnings = Math.round((agg._sum.amount ?? 0) / 100);

  // TODO: replace with real data
  const bookingTrend: TrendPoint[] = [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 18 },
    { label: "Wed", value: 9 },
    { label: "Thu", value: 22 },
    { label: "Fri", value: 27 },
    { label: "Sat", value: 33 },
    { label: "Sun", value: 16 },
  ];

  // TODO: replace with real data
  const revenueByMonth: TrendPoint[] = [
    { label: "Apr", value: 52 },
    { label: "May", value: 63 },
    { label: "Jun", value: 58 },
    { label: "Jul", value: 71 },
    { label: "Aug", value: 66 },
    { label: "Sep", value: earnings },
  ];

  return {
    kpi: { totalUsers, totalVenues, totalBookings, earnings },
    bookingTrend,
    revenueByMonth,
  };
}
