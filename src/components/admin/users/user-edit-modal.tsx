"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminUserRow } from "@/app/admin/users/page";
import { adminUpdateUser } from "@/app/actions/admin/user-actions";

export default function UserEditModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: (AdminUserRow & { emailVerified?: boolean }) | null;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState(user);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(user), [user]);

  const onChange = <K extends keyof NonNullable<typeof form>>(
    key: K,
    value: NonNullable<typeof form>[K]
  ) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const onSubmit = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await adminUpdateUser({
        id: form.id,
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        emailVerified: form.emailVerified,
      });
      if (res.ok) {
        toast.success("User updated");
        onSaved?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to update user");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>

        {form && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="fullName" className="mb-1">
                Full name
              </Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => onChange("fullName", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v: "USER" | "OWNER" | "ADMIN") =>
                    onChange("role", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="OWNER">OWNER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label>Email verified</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle verification state
                  </p>
                </div>
                <Switch
                  checked={Boolean(form.emailVerified)}
                  onCheckedChange={(v) => onChange("emailVerified", v)}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
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
