"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupSchema } from "@/lib/validation";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
      businessName: "",
      ownerAddress: "",
      phone: "",
    },
  });
  const role = form.watch("role");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setAvatar(url);
      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: SignupSchema) => {
    try {
      setLoading(true);
      const payload = { ...data, image: avatar };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("OTP sent to your email!");
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      } else {
        if (res.status === 409) {
          toast.error("Email already registered");
        } else {
          toast.error("Signup failed");
        }
      }
    } catch (error) {
      console.error("error", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border">
            <Image
              src={avatar || "/avatar-default.svg"}
              alt="avatar"
              fill
              className="object-cover"
            />
          </div>
          <label className="cursor-pointer text-sm flex items-center gap-1 outline-1 p-2 rounded-4xl hover:bg-accent hover:text-accent-foreground border">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Uploading..." : "Change Avatar"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USER">Player</SelectItem>
                  <SelectItem value="OWNER">Sports facility owner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Owner-only fields */}
        {role === "OWNER" && (
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="QuickCourt Pvt Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Input placeholder="12 MG Road, Bengaluru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading || uploading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
}
