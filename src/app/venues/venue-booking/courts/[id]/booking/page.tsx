import { redirect } from "next/navigation";
import { getCourtDetails } from "@/app/actions/player/get-court-details";
import { getServerSession } from "next-auth";
import BookingForm from "@/components/player/venues/venue-booking/booking/BookingForm";
import { authOptions } from "@/lib/auth";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=/venues/venue-booking/courts/${id}/booking`);
  }

  if (session.user.role !== "USER") {
    redirect("/");
  }

  const courtId = Number(id);
  const courtData = await getCourtDetails(courtId);
  if (!courtData.ok) {
    redirect("/404");
  }
  const court = courtData.court;

  return (
    <main className="max-w-xl mx-auto p-6 md:p-12 bg-white rounded-3xl shadow-lg my-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Book <span className="text-green-600">{court.name}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sport: <span className="font-semibold">{court.sport}</span> &bull;
          Price:{" "}
          <span className="font-semibold">
            ₹{court.pricePerHour.toLocaleString("en-IN")}/hr
          </span>
        </p>
        <p className="mt-1 text-gray-500">Venue: {court.venue.name}</p>
      </header>

      <div className="border-t border-gray-200 pt-6">
        <BookingForm courtId={court.id} />
      </div>
    </main>
  );
}
