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
  openTime: number; // e.g. 9
  closeTime: number; // e.g. 21
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

  // Function to fetch booked slots for a specific date
  const fetchBookedSlots = useCallback(
    async (date: Date) => {
      setFetchingSlots(true);
      try {
        // Build YYYY-MM-DD in local calendar to avoid UTC shift
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        const response = await fetch(
          `/api/bookings?courtId=${courtId}&date=${dateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched booked slots:", data.bookedSlots);
          setBookedSlots(data.bookedSlots || []);
        } else {
          console.error("Failed to fetch booked slots:", response.statusText);
          setBookedSlots([]);
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        setBookedSlots([]);
      } finally {
        setFetchingSlots(false);
      }
    },
    [courtId]
  );

  // Helper function to check if a time slot is booked
  const isHourBooked = useCallback(
    (hour: number) => {
      return bookedSlots.some((slot) => {
        // Use blockedHours array if available, otherwise fall back to range check
        if (slot.blockedHours && slot.blockedHours.length > 0) {
          return slot.blockedHours.includes(hour);
        }
        // Fallback: Check if the hour falls within any booked slot
        return hour >= slot.startHour && hour < slot.endHour;
      });
    },
    [bookedSlots]
  );

  // Helper function to check if a time range conflicts with existing bookings
  const hasConflict = useCallback(
    (startHr: number, endHr: number) => {
      return bookedSlots.some((slot) => {
        // Check for overlap: (startHr < slot.endHour) && (endHr > slot.startHour)
        return startHr < slot.endHour && endHr > slot.startHour;
      });
    },
    [bookedSlots]
  );

  // Generate all possible hour options
  const hourOptions: string[] = [];
  for (let h = openTime; h < closeTime; h++) {
    hourOptions.push(h.toString());
  }

  // Get available hours for start time (excluding booked slots)
  const availableStartHours = hourOptions.filter(
    (hour) => !isHourBooked(Number(hour))
  );

  // Get available hours for end time based on selected start hour
  const availableEndHours = hourOptions.filter((hour) => {
    const hourNum = Number(hour);
    const startHourNum = Number(startHour);

    // End hour must be after start hour
    if (hourNum <= startHourNum) return false;

    // Check if this end hour would create a conflict
    if (hasConflict(startHourNum, hourNum)) return false;

    return true;
  });

  // Fetch booked slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate, fetchBookedSlots]);

  // Auto-select first available start hour if current selection is booked
  useEffect(() => {
    if (
      bookedSlots.length > 0 &&
      startHour &&
      isHourBooked(Number(startHour))
    ) {
      const firstAvailableHour = availableStartHours[0];
      if (firstAvailableHour) {
        form.setValue("startHour", firstAvailableHour);
      }
    }
  }, [bookedSlots, startHour, availableStartHours, form, isHourBooked]);

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

    // Check for conflicts with existing bookings
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

      // ALWAYS attempt to parse JSON, regardless of `res.ok`
      // This way, even error responses with JSON bodies can be handled
      let resData;
      try {
        resData = await res.json();
      } catch (jsonError) {
        // If parsing fails, it's likely an empty or malformed non-JSON response
        // This is where your original SyntaxError was coming from
        toast.error("Server responded with malformed data or no data.");
        setLoading(false);
        console.error("JSON parsing error:", jsonError);
        return; // Stop execution here as we can't process the response
      }

      if (res.ok) {
        if (resData.url) {
          window.location.href = resData.url; // Redirect to Stripe Checkout
        } else {
          toast.error("Payment URL not received from a successful booking."); // More specific message
          setLoading(false);
        }
      } else {
        // Now resData is guaranteed to exist and be an object if the `res.json()` didn't throw
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
              <Skeleton className="h-4 w-24" /> {/* label skeleton */}
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* select skeleton */}
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" /> {/* label skeleton */}
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* select skeleton */}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Start Hour dropdown */}
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
                        {hourOptions.map((hour) => {
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

            {/* End Hour dropdown */}
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
                        {hourOptions.map((hour) => {
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
          {/* here if fetching time slots, disable button */}
          {loading || fetchingSlots ? "Waiting" : "Book Now"}
        </Button>
      </form>
    </Form>
  );
}
