"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CancelBookingInput {
  bookingId: number;
}

export async function cancelBooking({ bookingId }: CancelBookingInput) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.userId !== Number(session.user.id)) {
    throw new Error("Forbidden: Cannot cancel another user's booking");
  }

  const today = new Date();
  const startDate = new Date(booking.startTime);
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (startDate <= today) {
    throw new Error("Booking cannot be cancelled on or after the start date");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      payment: {
        update: { status: "REFUNDED" },
      },
    },
  });
  revalidatePath("/player/bookings");

  return { ok: true, message: "Booking cancelled successfully" };
}
