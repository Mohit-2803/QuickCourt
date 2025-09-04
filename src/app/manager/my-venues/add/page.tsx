// app/my-venues/new/page.tsx
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VenueForm from "@/components/manager/venue/venue-form";

export const metadata = {
  title: "Add Venue",
  description: "Add a new sports venue to manage.",
};

export default async function NewVenuePage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-6 md:p-8 space-y-6">
      <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="h-40 rounded-xl bg-muted animate-pulse" />
            }
          >
            <VenueForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
