"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BookingFormProps {
  courtId: number;
  openTime: number;
  closeTime: number;
}

const bookingSchema = z.object({
  date: z.date(),
  startHour: z.string(),
  endHour: z.string(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type BookedSlot = {
  startHour: number;
  endHour: number;
  status: string;
  blockedHours: number[];
};

export default function BookingForm({
  courtId,
  openTime,
  closeTime,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: new Date(),
      startHour: openTime.toString(),
      endHour: (openTime + 1).toString(),
      notes: "",
    },
  });

  const startHour = form.watch("startHour");
  const endHour = form.watch("endHour");
  const selectedDate = form.watch("date");

  // Helpers
  const formatDateYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchBookedSlots = useCallback(
    async (date: Date) => {
      setFetchingSlots(true);
      try {
        const dateStr = formatDateYMD(date);
        const res = await fetch(
          `/api/bookings?courtId=${courtId}&date=${dateStr}`
        );

        if (!res.ok) {
          console.error(
            "Failed to fetch booked slots:",
            res.status,
            res.statusText
          );
          setBookedSlots([]);
          return;
        }

        const data = await res.json();

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const computedSlots: BookedSlot[] = (data.bookedSlots || [])
          .map((b: { startTime: string; endTime: string; status: string }) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);

            if (end <= dayStart || start >= dayEnd) return null;

            const clampedStartTime = Math.max(
              start.getTime(),
              dayStart.getTime()
            );
            const clampedEndTime = Math.min(end.getTime(), dayEnd.getTime());

            const clampedStart = new Date(clampedStartTime);
            const clampedEnd = new Date(clampedEndTime);

            const startHourLocal = clampedStart.getHours();
            let endHourLocal = clampedEnd.getHours();
            if (
              clampedEnd.getMinutes() > 0 ||
              clampedEnd.getSeconds() > 0 ||
              clampedEnd.getMilliseconds() > 0
            ) {
              endHourLocal = endHourLocal + 1;
            }
            if (endHourLocal > 24) endHourLocal = 24;

            const blockedHours: number[] = [];
            for (let h = startHourLocal; h < endHourLocal; h++) {
              if (h >= 0 && h <= 23) blockedHours.push(h);
            }

            return {
              startHour: startHourLocal,
              endHour: endHourLocal,
              status: b.status,
              blockedHours,
            } as BookedSlot;
          })
          .filter(Boolean) as BookedSlot[];

        setBookedSlots(computedSlots);
      } catch (err) {
        console.error("Error fetching booked slots:", err);
        setBookedSlots([]);
      } finally {
        setFetchingSlots(false);
      }
    },
    [courtId]
  );

  const isHourBooked = useCallback(
    (hour: number) => {
      return bookedSlots.some((slot) => {
        if (slot.blockedHours && slot.blockedHours.length > 0) {
          return slot.blockedHours.includes(hour);
        }
        return hour >= slot.startHour && hour < slot.endHour;
      });
    },
    [bookedSlots]
  );

  const hasConflict = useCallback(
    (startHr: number, endHr: number) => {
      return bookedSlots.some((slot) => {
        return startHr < slot.endHour && endHr > slot.startHour;
      });
    },
    [bookedSlots]
  );

  const startHourOptions: string[] = [];
  for (let h = openTime; h < closeTime; h++) {
    startHourOptions.push(h.toString()); // last start = closeTime - 1
  }

  const endHourOptions: string[] = [];
  for (let h = openTime + 1; h <= closeTime; h++) {
    endHourOptions.push(h.toString()); // end can equal closeTime
  }

  const availableStartHours = startHourOptions.filter(
    (hour) => !isHourBooked(Number(hour))
  );
  const availableEndHours = endHourOptions.filter((hour) => {
    const hourNum = Number(hour);
    const startHourNum = Number(startHour);
    if (hourNum <= startHourNum) return false;
    if (hasConflict(startHourNum, hourNum)) return false;
    return true;
  });

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate, fetchBookedSlots]);

  useEffect(() => {
    if (
      bookedSlots.length > 0 &&
      startHour &&
      isHourBooked(Number(startHour))
    ) {
      const firstAvailableHour = availableStartHours[0];
      if (firstAvailableHour) {
        form.setValue("startHour", firstAvailableHour);
        const nextHour = Math.min(Number(firstAvailableHour) + 1, closeTime);
        form.setValue("endHour", nextHour.toString());
      }
    }
  }, [
    bookedSlots,
    startHour,
    availableStartHours,
    form,
    isHourBooked,
    closeTime,
  ]);

  useEffect(() => {
    if (startHour && endHour) {
      if (Number(endHour) <= Number(startHour)) {
        const nextHour = Math.min(Number(startHour) + 1, closeTime);
        form.setValue("endHour", nextHour.toString());
      }
    }
  }, [startHour, endHour, form, closeTime]);

  async function onSubmit(data: BookingFormValues) {
    const { date, startHour, endHour, notes } = data;

    const startDateTime = new Date(date);
    startDateTime.setHours(Number(startHour), 0, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(Number(endHour), 0, 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }
    if (startDateTime < new Date()) {
      toast.error("Start time must be in the future");
      return;
    }

    const startHourNum = Number(startHour);
    const endHourNum = Number(endHour);
    if (hasConflict(startHourNum, endHourNum)) {
      toast.error(
        "The selected time slot conflicts with an existing booking. Please choose a different time."
      );
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const idempotencyKey = `${courtId}-${startDateTime.toISOString()}-${endDateTime.toISOString()}`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes,
          idempotencyKey,
        }),
      });

      let resData;
      try {
        resData = await res.json();
      } catch (jsonError) {
        toast.error("Server responded with malformed data or no data.");
        setLoading(false);
        console.error("JSON parsing error:", jsonError);
        return;
      }

      if (res.ok) {
        if (resData.url) {
          window.location.href = resData.url;
        } else {
          toast.error("Payment URL not received from a successful booking.");
          setLoading(false);
        }
      } else {
        if (res.status === 409) {
          toast.error(resData.error || "This time slot is already booked.");
        } else if (res.status === 404) {
          toast.error(resData.error || "Court not found.");
        } else {
          toast.error(
            resData.error || "Failed to create booking. Please try again."
          );
        }
        setLoading(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Unexpected client-side error: ${error.message}`);
        console.error("Client-side error during fetch:", error);
      } else {
        toast.error("An unknown client-side error occurred.");
      }
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-4 rounded-md bg-green-100 text-green-900">
        Booking successful! We have emailed you the details.
      </div>
    );
  }

  const today = new Date();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="border rounded-md p-4">
              <FormLabel>Select Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date.getTime() <
                    new Date(today.setHours(0, 0, 0, 0)).getTime()
                  }
                  initialFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fetchingSlots ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Start */}
            <FormField
              control={form.control}
              name="startHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select start hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {startHourOptions.map((hour) => {
                          const hourNum = Number(hour);
                          const isBooked = isHourBooked(hourNum);
                          return (
                            <SelectItem
                              key={hour}
                              value={hour}
                              disabled={isBooked}
                              className={`cursor-pointer ${
                                isBooked
                                  ? "text-red-500 opacity-50 cursor-not-allowed"
                                  : "text-green-600"
                              }`}
                            >
                              {`${hourNum % 12 || 12}:00 ${
                                hourNum >= 12 ? "PM" : "AM"
                              }${isBooked ? " (Booked)" : ""}`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End */}
            <FormField
              control={form.control}
              name="endHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select end hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {endHourOptions.map((hour) => {
                          const hourNum = Number(hour);
                          const startHourNum = Number(startHour);
                          const isAfterStart = hourNum > startHourNum;
                          const wouldConflict =
                            isAfterStart && hasConflict(startHourNum, hourNum);
                          const isAvailable = availableEndHours.includes(hour);

                          return (
                            <SelectItem
                              key={hour}
                              value={hour}
                              disabled={!isAfterStart || wouldConflict}
                              className={`cursor-pointer ${
                                !isAfterStart || wouldConflict
                                  ? "text-gray-400 opacity-50 cursor-not-allowed"
                                  : isAvailable
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {`${hourNum % 12 || 12}:00 ${
                                hourNum >= 12 ? "PM" : "AM"
                              }${
                                !isAfterStart
                                  ? " (Invalid)"
                                  : wouldConflict
                                  ? " (Conflicts)"
                                  : ""
                              }`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading || fetchingSlots}
        >
          {loading || fetchingSlots ? "Waiting" : "Book Now"}
        </Button>
      </form>
    </Form>
  );
}
