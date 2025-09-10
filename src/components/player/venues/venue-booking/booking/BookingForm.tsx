"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

export default function BookingForm({
  courtId,
  openTime,
  closeTime,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    if (startHour && endHour) {
      if (Number(endHour) <= Number(startHour)) {
        const nextHour = Math.min(Number(startHour) + 1, closeTime);
        form.setValue("endHour", nextHour.toString());
      }
    }
  }, [startHour, endHour, form, closeTime]);

  const hourOptions: string[] = [];
  for (let h = openTime; h < closeTime; h++) {
    hourOptions.push(h.toString());
  }

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

        <div className="grid grid-cols-2">
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
                      {hourOptions.map((hour) => (
                        <SelectItem
                          key={hour}
                          value={hour}
                          className="cursor-pointer"
                        >
                          {`${Number(hour) % 12 || 12}:00 ${
                            Number(hour) >= 12 ? "PM" : "AM"
                          }`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      {hourOptions.map((hour) => (
                        <SelectItem
                          key={hour}
                          value={hour}
                          className="cursor-pointer"
                        >
                          {`${Number(hour) % 12 || 12}:00 ${
                            Number(hour) >= 12 ? "PM" : "AM"
                          }`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Now"}
        </Button>
      </form>
    </Form>
  );
}
