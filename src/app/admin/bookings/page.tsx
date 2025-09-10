import prisma from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBookingsTable from "@/components/admin/bookings/table";

export type AdminBookingRow = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  courtName: string;
  sport: string;
  venueName: string;
  city: string;
  startTime: string; // ISO
  endTime: string; // ISO
  amountMajor: number;
  paymentStatus?: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | null;
};

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true, avatarUrl: true } },
      court: {
        select: {
          name: true,
          sport: true,
          venue: { select: { name: true, city: true } },
        },
      },
      payment: { select: { amount: true, status: true } },
    },
  });

  const rows: AdminBookingRow[] = bookings.map((b) => ({
    id: String(b.id),
    status: b.status as AdminBookingRow["status"],
    userName: b.user.fullName,
    userEmail: b.user.email,
    userAvatar: b.user.avatarUrl ?? null,
    courtName: b.court.name,
    sport: b.court.sport,
    venueName: b.court.venue.name,
    city: b.court.venue.city,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    amountMajor: Math.round((b.payment?.amount ?? 0) / 100),
    paymentStatus:
      (b.payment?.status as AdminBookingRow["paymentStatus"]) ?? null,
  }));

  const all = rows;
  const pending = rows.filter((r) => r.status === "PENDING");
  const confirmed = rows.filter((r) => r.status === "CONFIRMED");
  const cancelled = rows.filter((r) => r.status === "CANCELLED");
  const completed = rows.filter((r) => r.status === "COMPLETED");

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">Bookings</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="cursor-pointer">
            All ({all.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="cursor-pointer">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="cursor-pointer">
            Confirmed ({confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="cursor-pointer">
            Cancelled ({cancelled.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="cursor-pointer">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <AdminBookingsTable data={all} />
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          <AdminBookingsTable data={pending} />
        </TabsContent>
        <TabsContent value="confirmed" className="mt-0">
          <AdminBookingsTable data={confirmed} />
        </TabsContent>
        <TabsContent value="cancelled" className="mt-0">
          <AdminBookingsTable data={cancelled} />
        </TabsContent>
        <TabsContent value="completed" className="mt-0">
          <AdminBookingsTable data={completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
