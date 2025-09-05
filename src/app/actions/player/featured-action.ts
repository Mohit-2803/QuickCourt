// app/actions/manager/court-event-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { recordEventSchema, RecordEventSchemaValues } from "@/lib/validation";

/**
 * Record a CourtEvent with optional dedupe by idempotencyKey.
 * Denormalizes venue.city into CourtEvent.city for faster per-city aggregations.
 */
export async function recordCourtEvent(input: RecordEventSchemaValues) {
  const parsed = recordEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues?.[0]?.message || "Invalid input",
    };
  }
  const { courtId, kind, source, idempotencyKey } = parsed.data;

  try {
    // Pull city from related venue for denormalization
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { venue: { select: { city: true } } },
    });
    if (!court) return { ok: false, error: "Court not found" };

    // If using idempotencyKey, check/skip duplicates within a short recent window
    // Option A: add a unique constraint by key (requires schema change).
    // Option B: soft-check recent events (below). Keep small window to avoid heavy scans.
    if (idempotencyKey) {
      // Optionally check for recent duplicates here if you want to implement deduplication.
      const existing = await prisma.courtEvent.findFirst({
        where: {
          courtId,
          kind,
          // if you add idempotencyKey column in schema, check it directly:
          idempotencyKey,
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // last 5 minutes
        },
        orderBy: { createdAt: "desc" },
      });

      // If you decide to store idempotencyKey in CourtEvent, do exact match:
      if (existing) return { ok: true, skipped: true };
      // No strict bail here by default.
    }

    await prisma.courtEvent.create({
      data: {
        courtId,
        kind, // VIEW|BOOKING
        source: source || null,
        idempotencyKey: idempotencyKey || null,
        city: court.venue.city || null,
      },
    });

    // Typically no revalidate for event writes; they are inputs to batch jobs.
    return { ok: true };
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to record event";
    return { ok: false, error: errorMessage };
  }
}
