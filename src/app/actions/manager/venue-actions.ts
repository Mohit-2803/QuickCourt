"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VenueSchema, VenueFormValues } from "@/lib/validation";
import { courtSchema, CourtFormValues } from "@/lib/validation";

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface AuthUser {
  id: string | number;
  role?: string;
}
export async function createVenue(input: VenueFormValues) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  // Only allow owners/admins to create venues
  const user = session.user as AuthUser;
  const role = user.role || session.role;
  if (role !== "OWNER" && role !== "ADMIN") {
    return { ok: false, error: "Insufficient permissions" };
  }

  // Validate payload with Zod (server-side)
  const parsed = VenueSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      issues: parsed.error.flatten(),
    };
  }
  const data = parsed.data;

  // Normalize slug (in case the client didn't auto-generate)
  const slug = toSlug(data.slug || data.name);
  if (!slug || slug.length < 2) {
    return { ok: false, error: "Invalid slug" };
  }

  // Resolve ownerId from FacilityOwner
  console.log("Resolving ownerId from FacilityOwner");
  console.log("Session user ID:", session.user.id);
  const owner = await prisma.facilityOwner.findUnique({
    where: { userId: Number(session.user.id) },
    select: { id: true },
  });
  if (!owner) {
    return { ok: false, error: "Owner profile not found" };
  }

  // Ensure slug is unique
  const existing = await prisma.venue.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: "Slug already in use" };
  }

  // Create venue
  try {
    const created = await prisma.venue.create({
      data: {
        ownerId: owner.id,
        name: data.name,
        slug,
        description: data.description ?? null,
        address: data.address,
        city: data.city,
        state: data.state ?? null,
        country: data.country ?? "India",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        amenities: data.amenities ?? [],
        photos: data.photos ?? [],
        approved: false,
      },
      select: { id: true, slug: true },
    });

    // Revalidate the venues listing for the manager area
    revalidatePath("/manager/my-venues");
    return { ok: true, venue: created };
  } catch (e: unknown) {
    // Handle unique constraint and generic DB errors
    let errorMessage = "Failed to create venue";
    if (typeof e === "object" && e !== null) {
      if ("code" in e && (e as { code?: string }).code === "P2002") {
        errorMessage =
          "Unique constraint failed (slug or another unique field).";
      } else if (
        "message" in e &&
        typeof (e as { message?: string }).message === "string"
      ) {
        errorMessage = (e as { message?: string }).message!;
      }
    }
    return { ok: false, error: errorMessage };
  }
}

export async function getOwnerVenues() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized", venues: [] };
  }

  // Allow OWNER or ADMIN to view; adjust as needed
  const role = (session.user as AuthUser).role || session.role;
  if (role !== "OWNER" && role !== "ADMIN") {
    return { ok: false, error: "Insufficient permissions", venues: [] };
  }

  // Find the FacilityOwner row for this user
  const owner = await prisma.facilityOwner.findUnique({
    where: { userId: Number(session.user.id) },
    select: { id: true },
  });
  if (!owner) {
    return { ok: true, venues: [] };
  }

  // Fetch venues for the owner
  const venues = await prisma.venue.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      country: true,
      address: true,
      description: true,
      approved: true,
      rating: true,
      photos: true,
      amenities: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { courts: true, reviews: true } },
    },
  });

  return { ok: true, venues };
}

export async function getVenueBySlugForOwner(slug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const role = (session.user as AuthUser).role || (session as AuthUser).role;
  if (role !== "OWNER" && role !== "ADMIN") {
    return { ok: false, error: "Insufficient permissions" };
  }

  const ownerUserId = Number(session.user.id);
  let owner = null as null | { id: number };
  if (role === "OWNER") {
    owner = await prisma.facilityOwner.findUnique({
      where: { userId: ownerUserId },
      select: { id: true },
    });
    if (!owner) {
      return { ok: false, error: "Owner profile not found" };
    }
  }

  // Fetch venue by slug and include minimal courts for the UI
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      approved: true,
      ownerId: true,
      courts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          sport: true,
          pricePerHour: true,
          currency: true,
          openTime: true,
          closeTime: true,
          image: true,
        },
      },
    },
  });

  if (!venue) {
    return { ok: false, error: "Venue not found" };
  }

  // Ownership check for owners (admins can view any)
  if (role === "OWNER" && owner && venue.ownerId !== owner.id) {
    return { ok: false, error: "Not allowed to view this venue" };
  }

  return { ok: true, venue };
}

export async function createCourtForVenue(
  slug: string,
  values: CourtFormValues
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const role = (session.user as AuthUser).role || (session as AuthUser).role;
  if (role !== "OWNER" && role !== "ADMIN")
    return { ok: false, error: "Insufficient permissions" };

  const parsed = courtSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error: "Validation failed",
      issues: parsed.error.flatten(),
    };

  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });

  if (!venue) return { ok: false, error: "Venue not found" };

  if (role === "OWNER") {
    const owner = await prisma.facilityOwner.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true },
    });
    if (!owner || owner.id !== venue.ownerId)
      return { ok: false, error: "Not allowed" };
  }

  try {
    const created = await prisma.court.create({
      data: {
        venueId: venue.id,
        name: parsed.data.name,
        sport: parsed.data.sport,
        pricePerHour: parsed.data.pricePerHour,
        currency: parsed.data.currency || "INR",
        openTime: parsed.data.openTime ?? "",
        closeTime: parsed.data.closeTime,
        image: parsed.data.image || "",
      },
      select: { id: true },
    });
    return { ok: true, court: created };
  } catch (e: unknown) {
    return {
      ok: false,
      error: (e as { message?: string })?.message || "Failed to create court",
    };
  }
}
