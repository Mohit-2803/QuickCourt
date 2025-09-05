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
