"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateUserProfile } from "@/app/actions/player/profile-update";

const editProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  currentName: string;
  currentAvatarUrl?: string | null;
  onSuccess?: () => void;
}

export default function EditProfileModal({
  currentName,
  currentAvatarUrl,
}: EditProfileModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: currentName,
      avatarUrl: currentAvatarUrl || "",
    },
  });

  async function onSubmit(data: EditProfileFormValues) {
    try {
      const response = await updateUserProfile({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl || undefined,
      });
      if (response.ok) {
        toast.success("Profile updated successfully!");
        setOpen(false);
        // Optionally refresh or update parent state here
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Unexpected error");
      } else {
        toast.error("Unexpected error");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full cursor-pointer">
          Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your name and avatar URL.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-4"
        >
          <div>
            <label htmlFor="fullName" className="block font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              {...form.register("fullName")}
              className="w-full rounded-md border p-2"
              placeholder="Enter your full name"
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block font-medium mb-1">
              Avatar URL (optional)
            </label>
            <input
              id="avatarUrl"
              {...form.register("avatarUrl")}
              className="w-full rounded-md border p-2"
              placeholder="https://your-avatar-url.com/img.png"
            />
            {form.formState.errors.avatarUrl && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.avatarUrl.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-4">
            <DialogClose asChild>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button className="cursor-pointer" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
