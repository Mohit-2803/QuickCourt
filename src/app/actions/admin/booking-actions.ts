"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import type { BookingStatus } from "@prisma/client";

function assertAdmin(session: Session | null) {
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function adminUpdateBookingStatus(
  id: string,
  next: BookingStatus
) {
  const session = await getServerSession(authOptions);
  assertAdmin(session);

  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) throw new Error("Invalid booking id");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: next },
      });

      if (next === "CANCELLED") {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: {
            paymentId: true,
            status: true,
            payment: { select: { status: true } },
          },
        });

        if (booking?.paymentId && booking.payment?.status === "SUCCEEDED") {
          await tx.payment.update({
            where: { id: booking.paymentId },
            data: { status: "REFUNDED" },
          });
        }
      }
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/manager/bookings");

    return { ok: true };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error(
      `Failed to update booking status: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function adminRefundBooking(id: string) {
  console.log("Refunding booking:", id);
  const session = await getServerSession(authOptions);
  assertAdmin(session);

  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) throw new Error("Invalid booking id");

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: {
          paymentId: true,
          payment: { select: { status: true } },
        },
      });
      console.log("Booking to refund:", booking);

      if (booking?.paymentId && booking.payment?.status === "SUCCEEDED") {
        await tx.payment.update({
          where: { id: booking.paymentId },
          data: { status: "REFUNDED" },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "CANCELLED" },
        });
      } else {
        throw new Error(
          "Booking cannot be refunded: either payment not found or payment status is not SUCCEEDED"
        );
      }
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/manager/bookings");
    return { ok: true };
  } catch (error) {
    console.error("Refund transaction failed:", error);
    throw new Error(
      `Failed to refund booking: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
