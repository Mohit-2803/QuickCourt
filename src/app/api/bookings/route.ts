import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

async function slotOverlaps(
  tx: Prisma.TransactionClient,
  courtId: number,
  start: Date,
  end: Date
) {
  return tx.booking.findFirst({
    where: {
      courtId,
      status: { in: ["CONFIRMED", "COMPLETED", "PENDING"] },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });
}

// GET method to fetch booked time slots for a court on a specific date
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");

    console.log("GET /api/bookings - Params:", { courtId, date });

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "courtId and date are required" },
        { status: 400 }
      );
    }

    // Parse the date and create start/end of day boundaries (UTC) to avoid timezone drift
    // Expect date as YYYY-MM-DD; construct UTC midnight range explicitly
    const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(date);
    let startOfDay: Date;
    let endOfDay: Date;
    let selectedDate: Date;

    if (ymdMatch) {
      // Use UTC range for the provided calendar day
      selectedDate = new Date(date);
      startOfDay = new Date(`${date}T00:00:00.000Z`);
      endOfDay = new Date(`${date}T23:59:59.999Z`);
    } else {
      selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }
      startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
    }

    console.log("Date boundaries:", {
      selectedDate: selectedDate.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    const bookings = await prisma.booking.findMany({
      where: {
        courtId: parseInt(courtId),
        status: { in: ["CONFIRMED", "COMPLETED", "PENDING"] },
        startTime: { lt: endOfDay },
        endTime: { gt: startOfDay },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    console.log("Database query results:", {
      courtIdParsed: parseInt(courtId),
      bookingsFound: bookings.length,
      bookings: bookings.map((b) => ({
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        status: b.status,
      })),
    });

    // Return ISO strings only — no .getHours() on the server
    const bookedSlots = bookings.map((booking) => ({
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status,
    }));

    return NextResponse.json({ bookedSlots });
  } catch (error: unknown) {
    console.error("Error fetching booked slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch booked slots" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courtId, startTime, endTime, notes, idempotencyKey } =
      await req.json(); // Moved inside try for proper error handling if JSON parsing fails

    // Parse date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (+end <= +start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check if booking with idempotencyKey already exists (retry logic)
    const existingBooking = await prisma.booking.findUnique({
      where: { idempotencyKey },
      select: { stripeCheckoutUrl: true, status: true }, // Select status to handle different idempotency scenarios
    });

    if (existingBooking) {
      if (existingBooking.stripeCheckoutUrl) {
        // If a booking with this key exists and has a checkout URL, redirect to it.
        return NextResponse.json({ url: existingBooking.stripeCheckoutUrl });
      } else {
        // If an existing booking exists but has no Stripe URL, it indicates an issue
        // or that the booking failed to proceed to checkout. Treat as a conflict.
        return NextResponse.json(
          {
            error: "A booking with this ID is already in an incomplete state.",
          },
          { status: 409 }
        );
      }
    }

    // Run transactional booking process
    const booking = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const conflict = await slotOverlaps(tx, courtId, start, end);
        if (conflict) {
          throw new Error("This slot is already booked!");
        }

        const court = await tx.court.findUnique({ where: { id: courtId } });
        if (!court) {
          throw new Error("Court not found");
        }

        const durationHours = (+end - +start) / 36e5;
        const amount = Math.round(court.pricePerHour * durationHours * 100);

        const sessionStripe = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: court.currency.toLowerCase(),
                product_data: {
                  name: `Booking for ${court.name}`,
                  ...(notes ? { description: notes } : {}),
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          metadata: {
            courtId: String(courtId),
            startTime,
            endTime,
            notes,
            userId: session.user.id,
            idempotencyKey, // Add idempotencyKey to metadata for webhook reconciliation
          },
          success_url: `${process.env.NEXT_PUBLIC_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/cancel`,
        });

        // Ensure sessionStripe.url exists before trying to use it
        if (!sessionStripe.url) {
          throw new Error("Failed to create Stripe checkout session URL.");
        }

        const newBooking = await tx.booking.create({
          data: {
            userId: Number(session.user.id),
            courtId,
            startTime: start,
            endTime: end,
            bookedForDate: start,
            notes,
            status: "PENDING",
            idempotencyKey, // This is already stored on Booking
            stripeCheckoutUrl: sessionStripe.url,
            payment: {
              create: {
                gateway: "stripe",
                stripePaymentIntentId: null, // Set to null initially
                stripeCheckoutSessionId: sessionStripe.id, // <--- Store the checkout session ID
                idempotencyKey: idempotencyKey, // <--- Store idempotencyKey on Payment too
                amount,
                paymentMethod: "card",
                currency: court.currency,
                status: "PENDING",
              },
            },
          },
          include: { payment: true },
        });

        return newBooking;
      }
    );

    return NextResponse.json({ url: booking.stripeCheckoutUrl });
  } catch (error: unknown) {
    // Catch SyntaxError specifically if req.json() fails
    if (error instanceof SyntaxError) {
      console.error("Server: JSON parsing error in request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }
    if (
      error instanceof Error &&
      error.message === "This slot is already booked!"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof Error && error.message === "Court not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Generic error handler: ALWAYS return a JSON response for any other error
    console.error("Server: Unhandled Booking API Error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
