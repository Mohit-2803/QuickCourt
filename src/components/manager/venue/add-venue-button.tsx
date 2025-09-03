import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function VenueHeaderAndButton({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Venues</h1>
        <p className="text-sm text-muted-foreground">{total} venues</p>
      </div>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        <Link href="/manager/my-venues/add">Add Venue</Link>
      </Button>
    </div>
  );
}
