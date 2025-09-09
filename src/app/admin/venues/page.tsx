// app/admin/venues/page.tsx
import VenuesTable from "@/components/admin/venues/venues-table";
import prisma from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Manage Venues",
  description: "Admin interface to manage and approve venues.",
};

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { createdAt: "desc" },
    // here select facility owner details
    include: { owner: true },
  });

  const rows = venues.map((venue) => ({
    ...venue,
    id: venue.id.toString(),
    owner: {
      ...venue.owner,
      id: venue.owner.id.toString(),
      businessName: venue.owner.businessName || null,
      phone: venue.owner.phone || null,
    },
  }));

  const pending = rows.filter((v) => !v.approved);
  const approved = rows.filter((v) => v.approved);

  return (
    <div className="mx-auto p-6 w-full max-w-7xl min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Venues</h1>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger className="cursor-pointer" value="approved">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="pending">
            Pending ({pending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <VenuesTable venues={pending} />
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          <VenuesTable venues={approved} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
