import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BookingList from "@/components/player/bookings/BookingList";
import Link from "next/link";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return <p>Please sign in to view your bookings.</p>;
  }

  const bookings = await prisma.booking.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { startTime: "desc" },
    include: { court: true, payment: true },
  });

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center mt-20 min-h-screen">
        No bookings found. Book a court to get started!
        <div className="mt-4">
          <Link href="/venues" className="text-blue-500 underline">
            Browse Courts
          </Link>
        </div>
      </div>
    );
  }

  return <BookingList bookings={bookings} />;
}
