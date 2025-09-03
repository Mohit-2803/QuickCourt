"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  userName: string;
  userAvatar?: string;
  court: string;
  date: string; // ISO or friendly string
  time: string; // e.g., "5:30 PM"
  status: BookingStatus;
}

const statusVariant: Record<BookingStatus, string> = {
  confirmed: "bg-green-600/15 text-green-500 border-green-700/30",
  pending: "bg-amber-600/15 text-amber-500 border-amber-700/30",
  cancelled: "bg-red-600/15 text-red-500 border-red-700/30",
};

const mockRecent: Booking[] = [
  {
    id: "bkg_001",
    userName: "Aarav Patel",
    userAvatar: "",
    court: "Court A",
    date: "2025-09-03",
    time: "5:30 PM",
    status: "confirmed",
  },
  {
    id: "bkg_002",
    userName: "Neha Sharma",
    userAvatar: "",
    court: "Court B",
    date: "2025-09-03",
    time: "6:15 PM",
    status: "pending",
  },
  {
    id: "bkg_003",
    userName: "Rahul Mehta",
    userAvatar: "",
    court: "Court C",
    date: "2025-09-04",
    time: "7:00 PM",
    status: "cancelled",
  },
  {
    id: "bkg_004",
    userName: "Kiran Rao",
    userAvatar: "",
    court: "Court A",
    date: "2025-09-04",
    time: "8:00 PM",
    status: "confirmed",
  },
];

export function RecentBookings({
  items = mockRecent,
  className,
}: {
  items?: Booking[];
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ul className="space-y-3">
          {items.map((b) => {
            // only first letter
            const initials = b.userName
              .split(" ")
              .map((p) => p.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={b.userAvatar || ""} alt={b.userName} />
                    <AvatarFallback className="font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.court} • {b.date} • {b.time}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0", statusVariant[b.status])}
                >
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
