import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { PaymentStatus, BookingStatus } from "@/generated/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(
      "Processing checkout.session.completed for session ID:",
      session.id
    );
    console.log("Session details:", JSON.stringify(session, null, 2));

    // Extract idempotencyKey from metadata
    const idempotencyKey = session.metadata?.idempotencyKey;

    if (!idempotencyKey) {
      console.error(
        `Missing idempotencyKey in metadata for session ${session.id}`
      );
      return NextResponse.json(
        {
          error: `Missing idempotencyKey in metadata for session ${session.id}`,
        },
        { status: 400 }
      );
    }

    if (session.payment_intent) {
      const paymentIntentId = session.payment_intent as string;
      const idempotencyKey = session.metadata?.idempotencyKey;

      if (!idempotencyKey) {
        console.error(
          `Missing idempotencyKey in metadata for session ${session.id}`
        );
        return NextResponse.json(
          { error: "Missing idempotencyKey" },
          { status: 400 }
        );
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["latest_charge"],
        }
      );

      const receiptUrl =
        paymentIntent.latest_charge &&
        typeof paymentIntent.latest_charge !== "string"
          ? paymentIntent.latest_charge.receipt_url
          : null;

      try {
        const booking = await prisma.booking.findUnique({
          where: { idempotencyKey: idempotencyKey },
          select: { id: true, status: true },
        });

        if (booking && booking.status === BookingStatus.PENDING) {
          const [updatedBooking, updatedPayment] = await prisma.$transaction([
            prisma.booking.update({
              where: { id: booking.id },
              data: { status: BookingStatus.CONFIRMED },
            }),
            prisma.payment.update({
              where: { bookingId: booking.id },
              data: {
                status: PaymentStatus.SUCCEEDED,
                stripePaymentIntentId: paymentIntentId,
                receiptUrl: receiptUrl || undefined,
              },
            }),
          ]);

          console.log(
            `Successfully confirmed Booking ID: ${updatedBooking.id}`
          );
          console.log(`Successfully updated Payment ID: ${updatedPayment.id}`);
        } else {
          console.warn(
            `Webhook for idempotencyKey ${idempotencyKey} received, but no corresponding PENDING booking was found. It might have already been processed.`
          );
        }
      } catch (error) {
        console.error("Error updating booking/payment from webhook:", error);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        `Checkout session ${session.id} completed without a payment_intent. This might be a setup or subscription intent.`
      );
    }
  } else if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Processing ${event.type} for session ID:`, session.id);
    console.log("Session details:", JSON.stringify(session, null, 2));

    const idempotencyKey = session.metadata?.idempotencyKey;
    const stripeCheckoutSessionId = session.id;

    if (!idempotencyKey) {
      console.error(
        `Missing idempotencyKey in metadata for session ${session.id} on ${event.type}`
      );
      return NextResponse.json(
        { error: `Missing idempotencyKey in metadata` },
        { status: 400 }
      );
    }

    const paymentIntentId = session.payment_intent as string | undefined; // It might be null for expired sessions

    // Find and update payment using idempotencyKey or checkout session ID
    const updatedPayments = await prisma.payment.updateMany({
      where: {
        OR: [
          { idempotencyKey: idempotencyKey },
          { stripeCheckoutSessionId: stripeCheckoutSessionId },
        ],
        status: PaymentStatus.PENDING, // Only update PENDING payments
      },
      data: {
        stripePaymentIntentId: paymentIntentId || null, // Store if available, else null
        status: PaymentStatus.FAILED,
      },
    });
    console.log(`Updated ${updatedPayments.count} Payment records to FAILED.`);

    // Find and update booking using idempotencyKey
    const updatedBookings = await prisma.booking.updateMany({
      where: {
        idempotencyKey: idempotencyKey,
        status: BookingStatus.PENDING, // Only update PENDING bookings
      },
      data: { status: BookingStatus.CANCELLED },
    });
    console.log(
      `Updated ${updatedBookings.count} Booking records to CANCELLED.`
    );
  }

  return NextResponse.json({ received: true });
}
