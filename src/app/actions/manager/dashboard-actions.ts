"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type DashboardStats = {
  totalBookings: number;
  activeCourts: number;
  earnings: number;
  upcoming: number;
};

export type TrendPoint = { day: string; bookings: number };
export type EarningPoint = { month: string; earnings: number };

export type RecentBookingItem = {
  id: string;
  userName: string;
  userAvatar?: string | null;
  court: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm-HH:mm
  status: "confirmed" | "pending" | "cancelled";
};

export type CalendarBooking = {
  id: number;
  title: string; // e.g., "Court A - Badminton"
  start: string; // ISO
  end: string; // ISO
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
};

export type ManagerDashboardData = {
  stats: DashboardStats;
  trends: TrendPoint[];
  earnings: EarningPoint[];
  calendar: CalendarBooking[];
  recent: RecentBookingItem[];
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toTimeRange(start: Date, end: Date) {
  return `${pad(start.getHours())}:${pad(start.getMinutes())}-${pad(
    end.getHours()
  )}:${pad(end.getMinutes())}`;
}
function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getManagerDashboardData(): Promise<ManagerDashboardData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const ownerScope = {
    court: {
      venue: {
        owner: {
          userId: Number(session?.user?.id ?? 0),
        },
      },
    },
  };

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday start (ISO-like)
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfPrevMonths = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d;
  });

  const [
    totalBookings,
    activeCourts,
    earningsAgg,
    upcomingCount,
    weekBookings,
    monthPayments,
    recentBookings,
    calendarBookings,
  ] = await Promise.all([
    prisma.booking.count({
      where: { ...ownerScope },
    }),
    prisma.court.count({
      where: {
        status: "ACTIVE",
        venue: {
          owner: {
            userId: Number(session?.user?.id ?? 0),
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        booking: { ...ownerScope, status: "CONFIRMED" },
        status: "SUCCEEDED",
      },
      _sum: { amount: true },
    }),
    prisma.booking.count({
      where: {
        ...ownerScope,
        status: "CONFIRMED",
        startTime: { gte: now },
      },
    }),
    // Weekly bookings: group by day (fetch then bucket in JS)
    prisma.booking.findMany({
      where: {
        ...ownerScope,
        createdAt: { gte: startOfWeek },
      },
      select: { createdAt: true },
    }),
    // Monthly earnings for last 6 months: fetch SUCCEEDED payments and bucket in JS
    prisma.payment.findMany({
      where: {
        booking: { ...ownerScope, status: "CONFIRMED" },
        status: "SUCCEEDED",
        createdAt: { gte: startOfPrevMonths[0] },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Recent bookings list (limited to 5)
    prisma.booking.findMany({
      where: { ...ownerScope },
      include: {
        user: true,
        court: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Calendar bookings: next 30 days
    prisma.booking.findMany({
      where: {
        ...ownerScope,
        startTime: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
      include: { court: true },
      orderBy: { startTime: "asc" },
      take: 200,
    }),
  ]);

  // Stats
  const earningsMinor = earningsAgg._sum.amount ?? 0;
  const stats: DashboardStats = {
    totalBookings,
    activeCourts,
    earnings: Math.round(earningsMinor / 100), // into INR major units
    upcoming: upcomingCount,
  };

  // Trends: bucket weekBookings into Mon..Sun
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trendMap = new Map(days.map((d) => [d, 0]));
  for (const b of weekBookings) {
    const d = new Date(b.createdAt);
    // Map JS getDay() (0=Sun) into our array index (Mon..Sun)
    const dayIdx = (d.getDay() + 6) % 7;
    const key = days[dayIdx];
    trendMap.set(key, (trendMap.get(key) || 0) + 1);
  }
  const trends: TrendPoint[] = days.map((d) => ({
    day: d,
    bookings: trendMap.get(d) || 0,
  }));

  // Earnings chart: bucket by month name for last 6 months
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
  const months = startOfPrevMonths.map((d) => monthFmt.format(d));
  const earningMap = new Map(months.map((m) => [m, 0]));
  for (const p of monthPayments) {
    const m = monthFmt.format(p.createdAt);
    earningMap.set(m, (earningMap.get(m) || 0) + (p.amount || 0));
  }
  const earnings: EarningPoint[] = months.map((m) => ({
    month: m,
    earnings: Math.round((earningMap.get(m) || 0) / 100),
  }));

  // Recent bookings mapped
  const recent: RecentBookingItem[] = recentBookings.map(
    (b: {
      id: number;
      startTime: Date;
      endTime: Date;
      status: string;
      user: { fullName: string; avatarUrl?: string | null };
      court: { name: string };
    }) => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      return {
        id: `BK${b.id.toString().padStart(4, "0")}`,
        userName: b.user.fullName,
        userAvatar: b.user.avatarUrl,
        court: b.court.name,
        date: toYMD(start),
        time: toTimeRange(start, end),
        status:
          b.status === "CONFIRMED"
            ? "confirmed"
            : b.status === "PENDING"
            ? "pending"
            : "cancelled",
      };
    }
  );

  // Calendar items
  const calendar: CalendarBooking[] = calendarBookings.map(
    (b: {
      id: number;
      court: { name: string; sport: string };
      startTime: Date;
      endTime: Date;
      status: string;
    }) => ({
      id: b.id,
      title: `${b.court.name} - ${b.court.sport}`,
      start: new Date(b.startTime).toISOString(),
      end: new Date(b.endTime).toISOString(),
      status: b.status as "CONFIRMED" | "PENDING" | "CANCELLED",
    })
  );

  return { stats, trends, earnings, calendar, recent };
}
