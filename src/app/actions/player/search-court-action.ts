"use server";

import prisma from "@/lib/prisma";
import { searchSchema, type SearchCourtSchemaValues } from "@/lib/validation";

export async function searchCourtsByCity(input: SearchCourtSchemaValues) {
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues?.[0]?.message || "Invalid input",
    };
  }
  const { city, sport, q, page, pageSize } = parsed.data;

  const where = {
    status: "ACTIVE" as const,
    venue: {
      approved: true,
      city: { equals: city, mode: "insensitive" as const },
    },
    ...(sport
      ? { sport: { equals: sport, mode: "insensitive" as const } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { venue: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const total = await prisma.court.count({ where });

  const courts = await prisma.court.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      name: true,
      sport: true,
      image: true,
      pricePerHour: true,
      currency: true,
      openTime: true,
      closeTime: true,
      venue: {
        select: {
          name: true,
          city: true,
          state: true,
          country: true,
          approved: true,
        },
      },
      ratingAgg: { select: { avg: true, count: true } },
    },
  });

  const items = courts.map((c) => ({
    id: c.id,
    name: c.name,
    venue: c.venue.name,
    sport: c.sport,
    price: c.pricePerHour,
    image: c.image,
    location: [c.venue.city, c.venue.state].filter(Boolean).join(", "),
    ratingAvg: c.ratingAgg?.avg ?? null,
    ratingCount: c.ratingAgg?.count ?? 0,
  }));

  return {
    ok: true,
    total,
    page,
    pageSize,
    items,
  };
}

export type SearchCourtsInput = {
  q?: string;
  sports?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  city?: string;
  page?: number;
  pageSize?: number;
};

export type SearchCourtsResultItem = {
  id: number;
  name: string;
  venue: string;
  sport: string;
  price: number;
  image: string;
  location: string;
  ratingAvg?: number | null;
  ratingCount?: number;
};

export type SearchCourtsResult = {
  items: SearchCourtsResultItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function searchCourts(
  input: SearchCourtsInput
): Promise<SearchCourtsResult> {
  const {
    q,
    sports = [],
    minPrice = 0,
    maxPrice = 1_000_000,
    minRating,
    city,
    page = 1,
    pageSize = 12,
  } = input || {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
    pricePerHour: { gte: minPrice, lte: maxPrice },
    venue: {
      approved: true,
      ...(city ? { city: { equals: city, mode: "insensitive" as const } } : {}),
    },
    ...(sports.length > 0 ? { sport: { in: sports } } : {}),
  };

  if (q && q.trim().length > 0) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { venue: { name: { contains: term, mode: "insensitive" } } },
      { venue: { address: { contains: term, mode: "insensitive" } } },
      { venue: { city: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (typeof minRating === "number") {
    where.ratingAgg = { avg: { gte: minRating } };
  }

  const skip = (Math.max(1, page) - 1) * Math.max(1, pageSize);
  const take = Math.max(1, pageSize);

  const total = await prisma.court.count({ where });

  const courts = await prisma.court.findMany({
    where,
    include: {
      venue: true,
      ratingAgg: true,
    },
    orderBy: [
      { ratingAgg: { avg: "desc" } },
      { pricePerHour: "asc" },
      { id: "asc" },
    ],
    skip,
    take,
  });

  const items: SearchCourtsResultItem[] = courts.map((c) => ({
    id: c.id,
    name: c.name,
    venue: c.venue.name,
    sport: c.sport,
    price: c.pricePerHour,
    image: c.image,
    location: [c.venue.city, c.venue.state].filter(Boolean).join(", "),
    ratingAvg: c.ratingAgg?.avg ?? null,
    ratingCount: c.ratingAgg?.count ?? 0,
  }));

  return { items, total, page, pageSize };
}
