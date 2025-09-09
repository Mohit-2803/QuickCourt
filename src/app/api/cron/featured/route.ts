// app/api/cron/featured/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Force runtime on each hit (avoid static prerender)
export const dynamic = "force-dynamic";

// Time window helpers
function startOfYesterdayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}
function endOfYesterdayUTC() {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

export async function GET(req: Request) {
  // Secure with CRON_SECRET (Vercel sends Authorization: Bearer $CRON_SECRET)
  const authHeader = req.headers.get("authorization") || "";
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null;
  if (expected && authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const from = startOfYesterdayUTC();
  const to = endOfYesterdayUTC();

  // Enumerate distinct, non-empty cities from approved venues that have active courts
  const cityRows = await prisma.venue.findMany({
    where: { approved: true, courts: { some: { status: "ACTIVE" } } },
    distinct: ["city"],
    select: { city: true },
  });

  const cities = cityRows
    .map((r) => (r.city || "").trim())
    .filter((c) => c.length > 0);

  const perCityCounts: Record<string, number> = {};

  for (const city of cities) {
    // Group events by courtId and kind within the window
    const grouped = await prisma.courtEvent.groupBy({
      by: ["courtId", "kind"],
      where: {
        city, // rely on denormalized city set at write time
        createdAt: { gte: from, lte: to },
      },
      _count: { _all: true },
    });

    // Fold to per-court counts
    const counts = new Map<number, { views: number; bookings: number }>();
    for (const g of grouped) {
      const cur = counts.get(g.courtId) ?? { views: 0, bookings: 0 };
      if (g.kind === "VIEW") cur.views += g._count._all;
      if (g.kind === "BOOKING") cur.bookings += g._count._all;
      counts.set(g.courtId, cur);
    }

    // If no events, skip writing a snapshot for this city
    if (counts.size === 0) {
      perCityCounts[city] = 0;
      continue;
    }

    // Compute scores
    const scored = Array.from(counts.entries()).map(([courtId, v]) => ({
      courtId,
      score: v.views + 3 * v.bookings,
    }));

    // Collect metadata for courts, filter by active/approved
    const courtIds = scored.map((s) => s.courtId);
    const courts = await prisma.court.findMany({
      where: {
        id: { in: courtIds },
        status: "ACTIVE",
        venue: { approved: true, city },
      },
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
    const allowed = new Set(courts.map((c) => c.id));

    const filtered = scored.filter((s) => allowed.has(s.courtId));
    filtered.sort((a, b) => b.score - a.score);
    const top = filtered.slice(0, 10);

    if (top.length === 0) {
      perCityCounts[city] = 0;
      continue;
    }

    // Build items for snapshot
    const items = top.map((t) => {
      const meta = courts.find((c) => c.id === t.courtId)!;
      return {
        courtId: meta.id,
        courtName: meta.name,
        sport: meta.sport,
        image: meta.image,
        pricePerHour: meta.pricePerHour,
        currency: meta.currency,
        venue: {
          id: meta.venue.id,
          name: meta.venue.name,
          city: meta.venue.city,
          slug: meta.venue.slug,
        },
        score: t.score,
      };
    });

    await prisma.featuredSnapshot.create({
      data: {
        city, // important: do not coalesce to null
        items: items as unknown as Prisma.JsonArray,
        computedAt: new Date(),
        validUntil: new Date(
          Date.UTC(
            from.getUTCFullYear(),
            from.getUTCMonth(),
            from.getUTCDate(),
            23,
            59,
            59,
            999
          )
        ),
      },
    });

    perCityCounts[city] = items.length;
  }

  return NextResponse.json({
    ok: true,
    window: { from, to },
    citiesProcessed: cities.length,
    written: perCityCounts,
  });
}
