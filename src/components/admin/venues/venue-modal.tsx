"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { updateVenueDetails } from "@/app/actions/admin/venue-actions";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export type VenueDetail = {
  id: string;
  name: string;
  city: string;
  address: string;
  slug: string;
  description?: string | null;
  approved: boolean;
  amenities?: string[];
  photos?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  owner?: {
    id: string;
    businessName?: string | null;
    phone?: string | null;
  };
};

export default function VenueModal({
  open,
  onOpenChange,
  venue,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  venue: VenueDetail | null;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<VenueDetail | null>(venue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(venue);
  }, [venue]);

  const onChange = (key: keyof VenueDetail, value: unknown) => {
    if (!form) return;
    setForm({ ...form, [key]: value } as VenueDetail);
  };

  const onSubmit = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await updateVenueDetails({
        id: form.id,
        name: form.name,
        city: form.city,
        address: form.address,
        slug: form.slug,
        description: form.description ?? null,
        approved: form.approved,
      });
      onSaved?.();
      onOpenChange(false);
      if (res.ok) {
        toast.success("Venue updated successfully");
      } else {
        toast.error("Failed to update venue");
      }
    } catch {
      toast.error("An error occurred while updating the venue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Venue details</DialogTitle>
        </DialogHeader>

        {form && (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="mb-1">
                    Venue Name
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="mb-1">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => onChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="mb-1">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => onChange("address", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="slug" className="mb-1">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => onChange("slug", e.target.value)}
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="description" className="mb-1">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={form.description ?? ""}
                    onChange={(e) => onChange("description", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>Approved</Label>
                    <p className="text-xs text-muted-foreground">
                      Toggle venue approval status
                    </p>
                  </div>
                  <Switch
                    checked={form.approved}
                    onCheckedChange={(val) => onChange("approved", val)}
                  />
                </div>
              </div>
            </div>

            {/* Owner (read-only) */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Owner</h3>
                  <p className="text-xs text-muted-foreground">
                    Linked account for this venue
                  </p>
                </div>
                {form.owner?.businessName ? (
                  <Badge variant="secondary" className="rounded-full">
                    <span>Verified Owner</span>
                  </Badge>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1">Business Name</Label>
                  <Input value={form.owner?.businessName ?? "—"} disabled />
                </div>
                <div>
                  <Label className="mb-1">Owner Phone</Label>
                  <Input value={form.owner?.phone ?? "—"} disabled />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1">Owner ID</Label>
                  <Input value={form.owner?.id ?? "—"} disabled />
                </div>
                <div>
                  <Label className="mb-1">Business Name</Label>
                  <Input value={form.owner?.businessName ?? "—"} disabled />
                </div>
              </div>
            </div>

            {/* Meta preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-xs text-muted-foreground">
                <div>
                  Created:{" "}
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleString()
                    : "—"}
                </div>
                <div>
                  Updated:{" "}
                  {form.updatedAt
                    ? new Date(form.updatedAt).toLocaleString()
                    : "—"}
                </div>
              </div>
              {form.amenities?.length ? (
                <div className="text-xs">
                  <span className="text-muted-foreground">Amenities:</span>{" "}
                  {form.amenities.join(", ")}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
