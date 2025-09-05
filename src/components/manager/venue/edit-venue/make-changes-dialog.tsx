"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateVenueBySlug } from "@/app/actions/manager/venue-actions";
import { UpdateVenueSchema, UpdateVenueFormValues } from "@/lib/validation";

type Props = {
  venue: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    address: string;
    city: string;
    state?: string | null;
    country?: string | null;
  };
  children: React.ReactNode;
};

export function MakeChangesDialog({ venue, children }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateVenueFormValues>({
    resolver: zodResolver(UpdateVenueSchema),
    defaultValues: {
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      city: venue.city,
      state: venue.state ?? "",
      country: venue.country ?? "",
      description: venue.description ?? "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: UpdateVenueFormValues) => {
    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state?.toString().trim() || undefined,
        country: values.country?.toString().trim() || undefined,
        description: values.description?.toString().trim() || undefined,
        amenities: undefined,
      };

      const res = await updateVenueBySlug(venue.slug, payload);
      if (!res.ok) {
        toast.error(res.error || "Failed to update venue");
        return;
      }
      toast.success("Venue updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Server error while updating venue");
    } finally {
      setSaving(false);
    }
  };

  // ensure form updates if venue prop changes (optional)
  useEffect(() => {
    if (!open) return;
    form.reset({
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      city: venue.city,
      state: venue.state ?? "",
      country: venue.country ?? "",
      description: venue.description ?? "",
    });
  }, [open, venue, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Venue name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="quickcourt-arena" />
                  </FormControl>
                  <FormDescription>
                    Lowercase, numbers and hyphens only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bengaluru" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="KA"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="India"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12 MG Road" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Venue description..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
