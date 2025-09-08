"use server";

import prisma from "@/lib/prisma";

export type CourtDetailsResult =
  | {
      ok: true;
      court: {
        id: number;
        name: string;
        sport: string;
        pricePerHour: number;
        currency: string;
        image: string;
        openTime: number;
        closeTime: number;
        ratingAvg: number | null;
        ratingCount: number;
        amenities: string[];
        venue: {
          id: number;
          name: string;
          city: string;
          state: string | null;
          country: string | null;
          description: string | null;
          latitude: number | null;
          longitude: number | null;
        };
      };
      moreCourts: Array<{
        id: number;
        name: string;
        sport: string;
        pricePerHour: number;
        image: string;
        ratingAvg: number | null;
        ratingCount: number | null;
      }>;
      reviews: Array<{
        id: number;
        user: string;
        rating: number;
        text: string | null;
        createdAt: string;
      }>;
    }
  | { ok: false; error: string };

export async function getCourtDetails(
  courtId: number
): Promise<CourtDetailsResult> {
  if (!Number.isFinite(courtId) || courtId <= 0) {
    return { ok: false, error: "Invalid court id" };
  }

  // Fetch court with venue and rating aggregate; ensure visibility
  const court = await prisma.court.findFirst({
    where: {
      id: courtId,
      status: "ACTIVE",
      venue: { approved: true },
    },
    select: {
      id: true,
      name: true,
      sport: true,
      image: true,
      pricePerHour: true,
      currency: true,
      openTime: true,
      closeTime: true,
      venueId: true,
      venue: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          country: true,
          description: true,
          latitude: true,
          longitude: true,
          amenities: true,
          photos: true,
          approved: true,
        },
      },
      ratingAgg: { select: { avg: true, count: true } },
    },
  });

  if (!court) {
    return { ok: false, error: "Court not found or not available" };
  }

  // More courts from the same venue (exclude current court, only ACTIVE)
  const siblingCourts = await prisma.court.findMany({
    where: {
      venueId: court.venueId,
      status: "ACTIVE",
      id: { not: court.id },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: 6,
    select: {
      id: true,
      name: true,
      sport: true,
      pricePerHour: true,
      image: true,
      ratingAgg: { select: { avg: true, count: true } },
    },
  });

  // Latest reviews for this court
  const courtReviews = await prisma.review.findMany({
    where: { courtId: court.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { fullName: true } },
    },
  });

  return {
    ok: true,
    court: {
      id: court.id,
      name: court.name,
      sport: court.sport,
      pricePerHour: court.pricePerHour,
      currency: court.currency,
      image: court.image,
      openTime: court.openTime,
      closeTime: court.closeTime,
      ratingAvg: court.ratingAgg?.avg ?? null,
      ratingCount: court.ratingAgg?.count ?? 0,
      amenities: court.venue.amenities ?? [],
      venue: {
        id: court.venue.id,
        name: court.venue.name,
        city: court.venue.city,
        state: court.venue.state,
        country: court.venue.country,
        description: court.venue.description,
        latitude: court.venue.latitude,
        longitude: court.venue.longitude,
      },
    },
    moreCourts: siblingCourts.map(
      (c: {
        id: number;
        name: string;
        sport: string;
        pricePerHour: number;
        image: string;
        ratingAgg?: { avg: number | null; count: number | null } | null;
      }) => ({
        id: c.id,
        name: c.name,
        sport: c.sport,
        pricePerHour: c.pricePerHour,
        ratingAvg: c.ratingAgg?.avg ?? null,
        ratingCount: c.ratingAgg?.count ?? 0,
        image: c.image,
      })
    ),
    reviews: courtReviews.map(
      (r: {
        id: number;
        rating: number;
        comment: string | null;
        createdAt: Date;
        user: { fullName: string };
      }) => ({
        id: r.id,
        user: r.user.fullName,
        rating: r.rating,
        text: r.comment,
        createdAt: r.createdAt.toISOString(),
      })
    ),
  };
}
