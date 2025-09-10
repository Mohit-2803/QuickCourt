"use client";

import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminBookingRow } from "@/app/admin/bookings/page";
import {
  adminRefundBooking,
  adminUpdateBookingStatus,
} from "@/app/actions/admin/booking-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function statusBadgeClass(s: AdminBookingRow["status"]) {
  switch (s) {
    case "CONFIRMED":
      return "border border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400";
    case "PENDING":
      return "border border-amber-600/30 bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "CANCELLED":
      return "border border-rose-600/30 bg-rose-600/10 text-rose-700 dark:text-rose-400";
    case "COMPLETED":
      return "border border-sky-600/30 bg-sky-600/10 text-sky-700 dark:text-sky-400";
    default:
      return "";
  }
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PAGE_SIZE = 10;

export default function AdminBookingsTable({
  data,
}: {
  data: AdminBookingRow[];
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const normalized = (s: string) => s.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = normalized(query);
    return data.filter((r) => {
      return (
        r.id.includes(q) ||
        normalized(r.userName).includes(q) ||
        normalized(r.userEmail).includes(q) ||
        normalized(r.courtName).includes(q) ||
        normalized(r.venueName).includes(q) ||
        normalized(r.city).includes(q) ||
        normalized(r.sport).includes(q)
      );
    });
  }, [data, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const rows = useMemo(
    () => filtered.slice(startIdx, endIdx),
    [filtered, startIdx, endIdx]
  );

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const onChangeStatus = (id: string, next: AdminBookingRow["status"]) => {
    setUpdatingId(id);
    startTransition(async () => {
      try {
        const response = await adminUpdateBookingStatus(id, next);
        if (!response.ok) {
          toast.error("Something went wrong");
        } else {
          toast.success("Booking status updated");
        }
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const onRefund = (id: string) => {
    setRefundingId(id);
    startTransition(async () => {
      try {
        const response = await adminRefundBooking(id);
        if (!response.ok) {
          toast.error("Something went wrong");
        } else {
          toast.success("Booking refunded");
        }
      } finally {
        setRefundingId(null);
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="w-full sm:w-80 p-4">
        <Input
          placeholder="Search bookings (id, user, court, venue, city)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="relative overflow-auto">
        <Table className="table-auto">
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <TableRow>
              <TableHead className="min-w-[240px]">User</TableHead>
              <TableHead className="min-w-[220px]">Court</TableHead>
              <TableHead className="min-w-[160px]">When</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="min-w-[120px]">Payment</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="text-right min-w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const start = new Date(r.startTime);
              const end = new Date(r.endTime);
              const isUpdating = updatingId === r.id;
              const isRefunding = refundingId === r.id;
              const canRefund =
                r.status === "CONFIRMED" && r.paymentStatus === "SUCCEEDED";

              return (
                <TableRow
                  key={r.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage
                          src={r.userAvatar ?? undefined}
                          alt={r.userName}
                        />
                        <AvatarFallback className="text-xs font-medium">
                          {initials(r.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.userEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Court */}
                  <TableCell>
                    <div className="font-medium truncate">{r.courtName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r.sport} • {r.venueName}, {r.city}
                    </div>
                  </TableCell>

                  {/* When */}
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{start.toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    ₹{r.amountMajor.toLocaleString("en-IN")}
                  </TableCell>

                  {/* Payment */}
                  <TableCell>
                    <Badge className="rounded-full">
                      {r.paymentStatus ?? "—"}
                    </Badge>
                  </TableCell>

                  {/* Status with dropdown */}
                  <TableCell>
                    <Select
                      value={r.status}
                      onValueChange={(val: AdminBookingRow["status"]) =>
                        onChangeStatus(r.id, val)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="h-8 cursor-pointer">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="cursor-pointer" value="PENDING">
                          <Badge
                            className={`rounded-full ${statusBadgeClass(
                              "PENDING"
                            )}`}
                          >
                            PENDING
                          </Badge>
                        </SelectItem>
                        <SelectItem
                          className="cursor-pointer"
                          value="CONFIRMED"
                        >
                          <Badge
                            className={`rounded-full ${statusBadgeClass(
                              "CONFIRMED"
                            )}`}
                          >
                            CONFIRMED
                          </Badge>
                        </SelectItem>
                        <SelectItem
                          className="cursor-pointer"
                          value="CANCELLED"
                        >
                          <Badge
                            className={`rounded-full ${statusBadgeClass(
                              "CANCELLED"
                            )}`}
                          >
                            CANCELLED
                          </Badge>
                        </SelectItem>
                        <SelectItem
                          className="cursor-pointer"
                          value="COMPLETED"
                        >
                          <Badge
                            className={`rounded-full ${statusBadgeClass(
                              "COMPLETED"
                            )}`}
                          >
                            COMPLETED
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isUpdating && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        disabled={!canRefund || isRefunding}
                        onClick={() => onRefund(r.id)}
                      >
                        {isRefunding ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Refunding
                          </span>
                        ) : (
                          "Refund"
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm text-muted-foreground">
          Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={page <= 1}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={page >= totalPages}
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
