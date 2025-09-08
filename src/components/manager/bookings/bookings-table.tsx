// components/manager/bookings/bookings-table.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  getManagerBookings,
  type ManagerBookingRow,
} from "@/app/actions/manager/booking-action";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusClasses: Record<ManagerBookingRow["status"], string> = {
  CONFIRMED: "bg-emerald-600/15 text-emerald-500 border-emerald-700/30",
  PENDING: "bg-amber-600/15 text-amber-500 border-amber-700/30",
  CANCELLED: "bg-red-600/15 text-red-500 border-red-700/30",
};

export default function BookingsTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | ManagerBookingRow["status"]>(
    "ALL"
  );

  const [rows, setRows] = useState<ManagerBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    const res = await getManagerBookings({
      q: query || undefined,
      status: status === "ALL" ? undefined : status,
      page,
      pageSize,
    });
    setRows(res.items);
    setTotal(res.total);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  const filtered = useMemo(() => rows, [rows]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm min-h-screen">
      <CardContent className="p-4 md:p-6">
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
            onValueChange={(v) =>
              setStatus(v as "ALL" | ManagerBookingRow["status"])
            }
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

        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Booking ID
                    </TableHead>
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
                      <TableCell className="whitespace-nowrap">
                        {b.venue}
                      </TableCell>
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
                        ₹{Number(b.amount / 100).toLocaleString("en-IN")}.00
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

            {/* Pagination controls */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {total === 0
                  ? "No results"
                  : `Showing ${startIdx}-${endIdx} of ${total}`}
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm min-w-[80px] text-center">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
