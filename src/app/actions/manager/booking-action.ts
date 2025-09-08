"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ManagerBookingsFilter = {
  q?: string;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";
  page?: number;
  pageSize?: number;
};

export type ManagerBookingRow = {
  id: string;
  user: string;
  court: string;
  sport: string;
  venue: string;
  date: string;
  time: string;
  amount: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  method: "UPI" | "Card" | "Cash" | "Unknown";
};

export type ManagerBookingsResult = {
  items: ManagerBookingRow[];
  total: number;
  page: number;
  pageSize: number;
};

function toTimeRange(start: Date, end: Date) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(start.getHours())}:${pad(start.getMinutes())}-${pad(
    end.getHours()
  )}:${pad(end.getMinutes())}`;
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getManagerBookings(
  input: ManagerBookingsFilter = {}
): Promise<ManagerBookingsResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const { q, status, page = 1, pageSize = 20 } = input;

  const take = Math.min(Math.max(pageSize, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;

  const where: import("@prisma/client").Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    court: { venue: { owner: { userId: Number(session?.user?.id) } } },
  };

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { idempotencyKey: { contains: term, mode: "insensitive" } },
      {
        payment: {
          is: {
            stripeCheckoutSessionId: { contains: term, mode: "insensitive" },
          },
        },
      },
      { user: { is: { fullName: { contains: term, mode: "insensitive" } } } },
      { court: { is: { name: { contains: term, mode: "insensitive" } } } },
      { court: { is: { sport: { contains: term, mode: "insensitive" } } } },
      {
        court: {
          is: {
            venue: { is: { name: { contains: term, mode: "insensitive" } } },
          },
        },
      },
      {
        court: {
          is: {
            venue: { is: { city: { contains: term, mode: "insensitive" } } },
          },
        },
      },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        user: true,
        court: { include: { venue: true } },
        payment: true,
      },
      orderBy: [{ createdAt: "desc" }],
      skip,
      take,
    }),
  ]);

  const items: ManagerBookingRow[] = bookings.map((b) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    const method: ManagerBookingRow["method"] = b.payment?.paymentMethod
      ?.toLowerCase()
      .includes("upi")
      ? "UPI"
      : b.payment?.paymentMethod?.toLowerCase().includes("card")
      ? "Card"
      : b.payment?.paymentMethod
      ? "Cash"
      : "Unknown";

    return {
      id: `BK${b.id.toString().padStart(4, "0")}`,
      user: b.user.fullName,
      court: b.court.name,
      sport: b.court.sport,
      venue: b.court.venue.name,
      date: toYMD(start),
      time: toTimeRange(start, end),
      amount: b.payment?.amount ?? 0, // minor units
      status: b.status as ManagerBookingRow["status"],
      method,
    };
  });

  return { items, total, page: Math.max(page, 1), pageSize: take };
}

export async function getManagerBookingsMetadata() {
  // here get this data All: 58 | Confirmed: 32 | Pending: 18 | Cancelled: 8
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { all: 0, confirmed: 0, pending: 0, cancelled: 0 };
  }
  const ownerScope = {
    court: { venue: { owner: { userId: Number(session?.user?.id) } } },
  };
  const [all, confirmed, pending, cancelled] = await Promise.all([
    prisma.booking.count({ where: ownerScope }),
    prisma.booking.count({ where: { ...ownerScope, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { ...ownerScope, status: "PENDING" } }),
    prisma.booking.count({ where: { ...ownerScope, status: "CANCELLED" } }),
  ]);
  return { all, confirmed, pending, cancelled };
}
