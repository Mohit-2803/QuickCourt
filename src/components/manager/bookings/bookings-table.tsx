"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

type BookingRow = {
  id: string;
  user: string;
  court: string;
  sport: string;
  venue: string;
  date: string; // YYYY-MM-DD
  time: string; // 17:30-18:30
  amount: number; // in INR
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  method: "UPI" | "Card" | "Cash";
};

const demo: BookingRow[] = [
  {
    id: "BK1001",
    user: "Aarav Patel",
    court: "Court A",
    sport: "Badminton",
    venue: "QuickCourt Arena",
    date: "2025-09-03",
    time: "17:30-18:30",
    amount: 600,
    status: "CONFIRMED",
    method: "UPI",
  },
  {
    id: "BK1002",
    user: "Neha Sharma",
    court: "Court B",
    sport: "Badminton",
    venue: "QuickCourt Arena",
    date: "2025-09-03",
    time: "19:00-20:00",
    amount: 600,
    status: "PENDING",
    method: "Card",
  },
  {
    id: "BK1003",
    user: "Rahul Mehta",
    court: "Court 1",
    sport: "Tennis",
    venue: "Metro Sports Hub",
    date: "2025-09-04",
    time: "07:00-08:00",
    amount: 800,
    status: "CANCELLED",
    method: "Cash",
  },
  {
    id: "BK1004",
    user: "Kiran Rao",
    court: "Turf 1",
    sport: "Football",
    venue: "Metro Sports Hub",
    date: "2025-09-04",
    time: "20:00-21:00",
    amount: 1500,
    status: "CONFIRMED",
    method: "UPI",
  },
  {
    id: "BK1005",
    user: "Isha Verma",
    court: "Court A",
    sport: "Badminton",
    venue: "QuickCourt Arena",
    date: "2025-09-05",
    time: "06:00-07:00",
    amount: 500,
    status: "CONFIRMED",
    method: "Card",
  },
];

const statusClasses: Record<BookingRow["status"], string> = {
  CONFIRMED: "bg-emerald-600/15 text-emerald-500 border-emerald-700/30",
  PENDING: "bg-amber-600/15 text-amber-500 border-amber-700/30",
  CANCELLED: "bg-red-600/15 text-red-500 border-red-700/30",
};

export default function BookingsTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | BookingRow["status"]>("ALL");

  const filtered = useMemo(() => {
    return demo.filter((b) => {
      const matchesText =
        !query ||
        b.id.toLowerCase().includes(query.toLowerCase()) ||
        b.user.toLowerCase().includes(query.toLowerCase()) ||
        b.venue.toLowerCase().includes(query.toLowerCase()) ||
        b.sport.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = status === "ALL" ? true : b.status === status;
      return matchesText && matchesStatus;
    });
  }, [query, status]);

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm min-h-screen">
      <CardContent className="p-4 md:p-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search by ID, user, venue, sport"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs
            defaultValue="ALL"
            value={status}
            onValueChange={(v) => setStatus(v as "ALL" | BookingRow["status"])}
          >
            <TabsList>
              <TabsTrigger className="cursor-pointer" value="ALL">
                All
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="CONFIRMED">
                Confirmed
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="PENDING">
                Pending
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="CANCELLED">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.id}</TableCell>
                  <TableCell>{b.user}</TableCell>
                  <TableCell className="whitespace-nowrap">{b.venue}</TableCell>
                  <TableCell>{b.sport}</TableCell>
                  <TableCell>{b.court}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>{b.time}</TableCell>
                  <TableCell>{b.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusClasses[b.status]}
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-green-800 font-medium">
                    ₹{b.amount.toLocaleString("en-IN")}.00
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground font-medium py-8"
                  >
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
