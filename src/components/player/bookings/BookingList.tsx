"use client";

import { useState } from "react";
import { Booking, Court, Payment } from "@/generated/prisma/wasm";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cancelBooking } from "@/app/actions/player/cancel-booking";

interface BookingWithRelations extends Booking {
  court: Court;
  payment: Payment | null;
}

interface BookingListProps {
  bookings: BookingWithRelations[];
}

export default function BookingList({ bookings }: BookingListProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const today = new Date();

  function canCancel(booking: Booking) {
    if (booking.status === "CANCELLED") return false;

    const startDate = new Date(booking.startTime);
    startDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    return startDate > todayDate;
  }

  async function handleCancelBooking(id: number) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setLoadingId(id);
    try {
      const response = await cancelBooking({ bookingId: id });
      if (response.ok) {
        toast.success("Booking cancelled successfully");
        window.location.reload();
      } else {
        toast.error(response.message || "Failed to cancel booking");
      }
    } catch {
      toast.error("Unexpected error");
    }
    setLoadingId(null);
  }

  return (
    <main className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-center text-gray-600">No bookings found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bookings.map((booking) => {
          const startFormatted = format(new Date(booking.startTime), "PPPp");
          const endFormatted = format(new Date(booking.endTime), "PPPp");
          const isCancellable = canCancel(booking);
          const receiptUrl = booking.payment?.receiptUrl || null;
          const statusColor =
            booking.status === "PENDING"
              ? "text-yellow-500"
              : booking.status === "CONFIRMED"
              ? "text-green-600"
              : booking.status === "CANCELLED"
              ? "text-red-500"
              : "text-gray-500";

          return (
            <article
              key={booking.id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {booking.court.name}
                </h2>
                <p className="text-gray-700 mb-1">
                  Booking from {startFormatted} till {endFormatted}
                </p>
                <p className="text-sm text-gray-500 mb-0">
                  Status:{" "}
                  <span className={`font-semibold ${statusColor}`}>
                    {booking.status}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {isCancellable && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={loadingId === booking.id}
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex-grow sm:flex-grow-0 cursor-pointer"
                  >
                    {loadingId === booking.id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}

                {receiptUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-grow sm:flex-grow-0"
                    asChild
                  >
                    <Link
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Receipt
                    </Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
