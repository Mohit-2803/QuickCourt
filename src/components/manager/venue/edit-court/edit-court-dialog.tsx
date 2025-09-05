"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateCourtById } from "@/app/actions/manager/venue-actions";
import { UpdateCourtSchema, UpdateCourtFormValues } from "@/lib/validation";

type Props = {
  court: {
    id: number;
    name: string;
    sport: string;
    pricePerHour: number;
    openTime: number;
    closeTime: number;
    currency: string;
  };
  children: React.ReactNode;
};

export function EditCourtDialog({ court, children }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateCourtFormValues>({
    resolver: zodResolver(UpdateCourtSchema),
    defaultValues: {
      name: court.name,
      sport: (court.sport as UpdateCourtFormValues["sport"]) || "Badminton",
      pricePerHour: court.pricePerHour,
      openTime: court.openTime,
      closeTime: court.closeTime,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: UpdateCourtFormValues) => {
    setSaving(true);
    try {
      const res = await updateCourtById(court.id, {
        name: values.name.trim(),
        sport: values.sport,
        openTime: values.openTime,
        closeTime: values.closeTime,
        pricePerHour: values.pricePerHour,
        currency: court.currency,
      });
      if (!res.ok) {
        toast.error(res.error || "Failed to update court");
        return;
      }
      toast.success("Court updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Server error while updating court");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset({
        name: court.name,
        sport: (court.sport as UpdateCourtFormValues["sport"]) || "Badminton",
        openTime: court.openTime,
        closeTime: court.closeTime,
        pricePerHour: court.pricePerHour,
      });
    }
  }, [
    court.closeTime,
    court.name,
    court.openTime,
    court.pricePerHour,
    court.sport,
    form,
    open,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Court</DialogTitle>
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
                    <Input {...field} placeholder="Court name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="openTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open (0–23)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={23} {...field} />
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
                    <FormLabel>Close (0–23)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={23} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per hour (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
