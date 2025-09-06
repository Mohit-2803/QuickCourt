// app/venues/[slug]/courts/new/_components/add-court-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { courtSchema, CourtFormValues } from "@/lib/validation";
import { createCourtForVenue } from "@/app/actions/manager/venue-actions";

async function uploadOne(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok)
    throw new Error((await res.text().catch(() => "")) || "Upload failed");
  const data = await res.json().catch(() => ({}));
  return data.url || data.secure_url || "";
}

export default function AddCourtForm({ slug }: { slug: string }) {
  const router = useRouter();
  const form = useForm<CourtFormValues>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: "",
      sport: "",
      pricePerHour: 0,
      currency: "INR",
      openTime: 6,
      closeTime: 22,
      image: undefined,
    },
  });

  const [localFile, setLocalFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // New: block submit when a file is selected but not uploaded to an URL yet
  const imagePendingUpload = !!localFile && !form.getValues("image");

  const handleUpload = async () => {
    if (!localFile) return;
    setUploading(true);
    try {
      const url = await uploadOne(localFile);
      form.setValue("image", url, { shouldDirty: true, shouldValidate: true });
      toast.success("Image uploaded");
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e
          ? (e as { message?: string }).message
          : "Upload failed";
      toast.error(errorMessage || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: CourtFormValues) => {
    // Guard: require uploaded image URL if a file was chosen
    if (imagePendingUpload) {
      toast.error("Please upload the selected image before submitting.");
      return;
    }

    setSaving(true);
    try {
      const res = await createCourtForVenue(slug, values);
      if (!res.ok) {
        toast.error(res.error || "Failed to create court");
        return;
      }
      toast.success("Court created");
      router.push(`/manager/venues/${slug}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border bg-card text-card-foreground p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Add Court</h1>

        {/* name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Court name</FormLabel>
              <FormControl>
                <Input placeholder="Court A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* sport */}
        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Badminton">Badminton</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Squash">Squash</SelectItem>
                  <SelectItem value="Table Tennis">Table Tennis</SelectItem>
                  <SelectItem value="Cricket">Cricket</SelectItem>
                  <SelectItem value="Box Cricket">Box Cricket</SelectItem>
                  <SelectItem value="Hockey">Hockey</SelectItem>
                  <SelectItem value="Baseball">Baseball</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Golf">Golf</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Choose a sport type.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* price + currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricePerHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per hour</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={50}
                    {...field}
                    value={typeof field.value === "number" ? field.value : 0}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input
                    placeholder="INR"
                    disabled
                    className="text-black"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Open time (0-23)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={23}
                    {...field}
                    value={typeof field.value === "number" ? field.value : 0}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="closeTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Close time (0-23)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={23}
                    {...field}
                    value={typeof field.value === "number" ? field.value : 0}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* image */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Court image</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://..."
                  value={field.value || ""}
                  onChange={field.onChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="cursor-pointer outline-1 rounded-md border bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:py-2 file:px-3 file:text-sm file:font-medium file:text-muted-foreground hover:file:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLocalFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUpload}
                  disabled={!localFile || uploading}
                  className="cursor-pointer"
                >
                  {uploading ? "Uploading..." : "Upload image"}
                </Button>
              </div>
              {imagePendingUpload && (
                <p className="text-xs text-amber-600">
                  A file is selected. Please click Upload image before
                  submitting.
                </p>
              )}
              <FormDescription>
                Paste a URL or upload via Cloudinary.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            className="cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:shadow-md hover:text-white"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={saving || uploading || imagePendingUpload}
            title={
              imagePendingUpload
                ? "Upload selected image before submitting"
                : undefined
            }
          >
            {saving ? "Saving..." : "Create Court"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
