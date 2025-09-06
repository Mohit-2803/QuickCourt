"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BookingFormProps {
  courtId: number;
}

const bookingSchema = z.object({
  startDateTime: z.string().nonempty("Start date/time is required"),
  endDateTime: z.string().nonempty("End date/time is required"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingForm({ courtId }: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDateTime: "",
      endDateTime: "",
      notes: "",
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setError(null);

    // Additional client-side validation for date ordering
    if (new Date(data.endDateTime) <= new Date(data.startDateTime)) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          startTime: data.startDateTime,
          endTime: data.endDateTime,
          notes: data.notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const resData = await res.json();
        setError(resData.error || "Failed to create booking");
      }
    } catch {
      setError("Unexpected error");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="p-4 rounded-md bg-green-100 text-green-900">
        Booking successful! We have emailed you the details.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-100 p-3 text-red-900 font-semibold">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="startDateTime"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="startDateTime">Start Date and Time</FormLabel>
              <FormControl>
                <Input id="startDateTime" type="datetime-local" {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDateTime"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="endDateTime">End Date and Time</FormLabel>
              <FormControl>
                <Input id="endDateTime" type="datetime-local" {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="notes">Additional Notes (optional)</FormLabel>
              <FormControl>
                <Textarea id="notes" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Booking..." : "Book Now"}
        </Button>
      </form>
    </Form>
  );
}
