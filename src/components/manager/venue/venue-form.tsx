"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRouter } from "next/navigation";
import { VenueFormValues, VenueSchema } from "@/lib/validation";
import { createVenue } from "@/app/actions/manager/venue-actions";

// Upload one file via /api/upload that returns { url } or { secure_url }
async function uploadOne(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok)
    throw new Error((await res.text().catch(() => "")) || "Upload failed");
  const data = await res.json().catch(() => ({}));
  return data.url || data.secure_url || "";
}

export default function VenueForm() {
  const router = useRouter();
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(VenueSchema),
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      description: "",
      amenities: [],
      photos: [], // final Cloudinary URLs
      latitude: undefined,
      longitude: undefined,
    },
  });

  const amenityOptions = [
    "parking",
    "lights",
    "locker",
    "washroom",
    "cafeteria",
    "outdoor",
    "Wifi",
    "CCTV Surveillance",
    "Refreshments",
  ];
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>(
    []
  );
  const [localFiles, setLocalFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadErrors, setUploadErrors] = React.useState<
    Record<string, string>
  >({});
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);

  // Auto-generate slug from venue name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  };

  // Watch for changes in venue name to auto-generate slug
  const watchedName = form.watch("name");
  React.useEffect(() => {
    if (watchedName && !form.getValues("slug")) {
      const generatedSlug = generateSlug(watchedName);
      form.setValue("slug", generatedSlug, { shouldDirty: true });
    }
  }, [watchedName, form]);

  function toggleAmenity(a: string) {
    setSelectedAmenities((prev) => {
      const next = prev.includes(a)
        ? prev.filter((x) => x !== a)
        : [...prev, a];
      form.setValue("amenities", next, { shouldDirty: true });
      return next;
    });
  }

  async function handleUploadSelected() {
    if (!localFiles.length || uploading) return;
    setUploading(true);
    setUploadErrors({});
    const results = await Promise.allSettled(
      localFiles.map((f) => uploadOne(f))
    );
    const successes: string[] = [];
    const errors: Record<string, string> = {};
    results.forEach((r, i) => {
      const name = localFiles[i].name;
      if (r.status === "fulfilled" && r.value) successes.push(r.value);
      else
        errors[name] =
          r.status === "rejected"
            ? r.reason?.message || "Upload failed"
            : "Upload failed";
    });
    const merged = [...uploadedUrls, ...successes];
    setUploadedUrls(merged);
    form.setValue("photos", merged, { shouldDirty: true });
    setUploadErrors(errors);
    setUploading(false);
  }

  async function onSubmit(values: VenueFormValues) {
    if (!uploadedUrls.length) {
      form.setError("photos", {
        type: "manual",
        message: "Please upload at least one photo.",
      });
      return;
    }
    const res = await createVenue({ ...values, photos: uploadedUrls });
    if (!res.ok) {
      // Show error (optionally use a toast)
      console.error(res.error);
      form.setError("slug", { type: "manual", message: res.error });
      return;
    }
    router.push(`/manager/my-venues`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue name</FormLabel>
                <FormControl>
                  <Input placeholder="QuickCourt Arena" {...field} />
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
                  <Input placeholder="quickcourt-arena" {...field} />
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
                  rows={4}
                  placeholder="Short description of the venue..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="12 MG Road" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Bengaluru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="KA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="12.9716"
                    inputMode="decimal"
                    type="number"
                    step="any"
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value);
                      field.onChange(
                        isNaN(value as number) ? undefined : value
                      );
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Optional for map/location features.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="77.5946"
                    inputMode="decimal"
                    type="number"
                    step="any"
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value);
                      field.onChange(
                        isNaN(value as number) ? undefined : value
                      );
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Optional for map/location features.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Amenities</FormLabel>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedAmenities.includes(a)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
                aria-pressed={selectedAmenities.includes(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <FormDescription>Select all that apply.</FormDescription>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="photos"
          render={() => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <div className="rounded-xl border p-4 bg-muted/30 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setLocalFiles(
                      e.target.files ? Array.from(e.target.files) : []
                    )
                  }
                />
                {!!localFiles.length && (
                  <ul className="text-xs">
                    {localFiles.map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{f.name}</span>
                        {uploadErrors[f.name] && (
                          <span className="text-red-500">
                            {uploadErrors[f.name]}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLocalFiles([]);
                      setUploadErrors({});
                    }}
                  >
                    Clear selection
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUploadSelected}
                    disabled={uploading || !localFiles.length}
                  >
                    {uploading ? "Uploading..." : "Upload selected"}
                  </Button>
                </div>
                {!!uploadedUrls.length && (
                  <div className="text-xs text-muted-foreground">
                    Uploaded: {uploadedUrls.length} file(s)
                  </div>
                )}
              </div>
              <FormDescription>
                First uploaded image will be used as the primary photo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            className="cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:shadow-md hover:text-white"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer" disabled={uploading}>
            {uploading ? "Please wait..." : "Create Venue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
