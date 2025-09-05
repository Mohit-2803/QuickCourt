"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";

// Input stays venue-based to update venue + all its courts in one go
const inputSchema = z.object({
  venueId: z.number().int().positive(),
});

export async function recomputeVenueAndCourtRatings(
  input: z.infer<typeof inputSchema>
) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues && parsed.error.issues.length > 0
          ? parsed.error.issues[0].message
          : "Invalid input",
    };
  }
  const { venueId } = parsed.data;

  // Load courts for this venue
  const courts = await prisma.court.findMany({
    where: { venueId },
    select: { id: true },
  });
  const courtIds = courts.map((c) => c.id);

  // If there are no courts, just zero venue rating and return
  if (courtIds.length === 0) {
    await prisma.venue.update({
      where: { id: venueId },
      data: { rating: null, updatedAt: new Date() },
    });
    return { ok: true, venueId, courtCount: 0, count: 0, avg: 0 };
  }

  // 1) Group counts per star in one query
  // If venueId is reliably set on Review, you can use: where: { venueId }
  // To be safe with court-based source of truth, aggregate via courtId IN courtIds.
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { courtId: { in: courtIds } },
    _count: { _all: true },
  });

  const buckets = { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 };
  for (const row of grouped) {
    if (row.rating === 1) buckets.s1 = row._count._all;
    else if (row.rating === 2) buckets.s2 = row._count._all;
    else if (row.rating === 3) buckets.s3 = row._count._all;
    else if (row.rating === 4) buckets.s4 = row._count._all;
    else if (row.rating === 5) buckets.s5 = row._count._all;
  }
  const count = buckets.s1 + buckets.s2 + buckets.s3 + buckets.s4 + buckets.s5;
  const avg =
    count > 0
      ? (1 * buckets.s1 +
          2 * buckets.s2 +
          3 * buckets.s3 +
          4 * buckets.s4 +
          5 * buckets.s5) /
        count
      : 0;

  // 2) Update Venue.rating
  // You could also compute venue-level avg as a weighted average of court-level avgs,
  // but aggregating the reviews directly is fine and accurate.
  // Use a transaction for venue + court aggregates to keep them consistent.
  await prisma.$transaction(async (tx) => {
    await tx.venue.update({
      where: { id: venueId },
      data: {
        rating: count ? avg : null,
        updatedAt: new Date(),
      },
    });

    // 3) Mirror aggregate to each court in the venue (simple strategy)
    // If you prefer true per-court aggregates, run groupBy per courtId instead.
    for (const c of courts) {
      await tx.courtRatingAggregate.upsert({
        where: { courtId: c.id },
        create: {
          courtId: c.id,
          stars1: buckets.s1,
          stars2: buckets.s2,
          stars3: buckets.s3,
          stars4: buckets.s4,
          stars5: buckets.s5,
          avg,
          count,
        },
        update: {
          stars1: buckets.s1,
          stars2: buckets.s2,
          stars3: buckets.s3,
          stars4: buckets.s4,
          stars5: buckets.s5,
          avg,
          count,
        },
      });
    }
  });

  return { ok: true, venueId, courtCount: courts.length, count, avg };
}
