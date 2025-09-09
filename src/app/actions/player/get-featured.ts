// app/actions/player/get-featured.ts
"use server";

import prisma from "@/lib/prisma";

export type FeaturedItem = {
  courtId: number;
  courtName: string;
  sport: string;
  image: string;
  pricePerHour: number;
  currency: string;
  venue: { id: number; name: string; city: string; slug: string };
  score: number;
};

export async function getFeaturedCourtsByCity(
  city: string
): Promise<FeaturedItem[]> {
  const snap = await prisma.featuredSnapshot.findFirst({
    where: { city },
    orderBy: { computedAt: "desc" },
  });

  const valid =
    snap && (!snap.validUntil || new Date(snap.validUntil) >= new Date());
  if (valid) {
    const items = (snap!.items as unknown as FeaturedItem[]) ?? [];
    return items.slice(0, 8);
  }

  // Fallback: recent active courts in approved venues
  const courts = await prisma.court.findMany({
    where: {
      status: "ACTIVE",
      venue: { approved: true, city },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      sport: true,
      image: true,
      pricePerHour: true,
      currency: true,
      venue: { select: { id: true, name: true, city: true, slug: true } },
    },
  });

  return courts.map((c) => ({
    courtId: c.id,
    courtName: c.name,
    sport: c.sport,
    image: c.image,
    pricePerHour: c.pricePerHour,
    currency: c.currency,
    venue: c.venue,
    score: 0,
  }));
}
