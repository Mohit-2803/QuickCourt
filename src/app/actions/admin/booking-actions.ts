"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import type { BookingStatus, PaymentStatus } from "@prisma/client";

function assertAdmin(session: Session | null) {
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

async function handleStatusSideEffects(bookingId: number, next: BookingStatus) {
  if (next === "CANCELLED") {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        paymentId: true,
        status: true,
        payment: { select: { status: true } },
      },
    });

    if (
      booking?.paymentId &&
      booking.payment?.status === ("SUCCEEDED" as PaymentStatus)
    ) {
      await prisma.payment.update({
        where: { id: booking.paymentId },
        data: { status: "REFUNDED" },
      });
    }
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/manager/bookings");
}

export async function adminUpdateBookingStatus(
  id: string,
  next: BookingStatus
) {
  const session = await getServerSession(authOptions);
  assertAdmin(session);

  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) throw new Error("Invalid booking id");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: next },
  });

  await handleStatusSideEffects(bookingId, next);

  revalidatePath("/admin/bookings");
  revalidatePath("/manager/bookings");

  return { ok: true };
}

export async function adminRefundBooking(id: string) {
  console.log("Refunding booking:", id);
  const session = await getServerSession(authOptions);
  assertAdmin(session);

  const bookingId = Number(id);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { paymentId: true },
  });
  console.log("Booking to refund:", booking);

  if (booking?.paymentId) {
    await prisma.payment.update({
      where: { id: booking.paymentId },
      data: { status: "REFUNDED" },
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/manager/bookings");
  return { ok: true };
}
