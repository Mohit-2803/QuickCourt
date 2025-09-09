"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";
import type { AdminUserRow } from "@/app/admin/users/page";
import { adminDeleteUser } from "@/app/actions/admin/user-actions";

export default function UserDeleteModal({
  open,
  onOpenChange,
  user,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AdminUserRow | null;
  onDeleted?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await adminDeleteUser(user.id);
      if (res.ok) {
        toast.success("User deleted");
        onDeleted?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to delete user");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently remove the user
            {user ? ` “${user.fullName}”` : ""} and associated account data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete user"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
