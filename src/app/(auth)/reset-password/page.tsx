"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ResetPasswordFormValues, resetPasswordSchema } from "@/lib/validation";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid password reset link");
      router.replace("/forgot-password");
    }
  }, [token, email, router]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: values.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to reset password");
        return;
      }

      toast.success("Password reset successful! Please log in.");
      router.push("/login");
    } catch {
      toast.error("Server error while resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
      {/* Left cover */}
      <div className="relative hidden lg:block">
        <Image
          src="/otp-image.jpg"
          alt="Reset Password"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Reset Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a new password for the account.
            </p>
          </div>

          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPwd ? "text" : "password"}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPwd((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={
                            showPwd ? "Hide password" : "Show password"
                          }
                        >
                          {showPwd ? (
                            <EyeOff className="h-4 w-4 cursor-pointer" />
                          ) : (
                            <Eye className="h-4 w-4 cursor-pointer" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4 cursor-pointer" />
                          ) : (
                            <Eye className="h-4 w-4 cursor-pointer" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  The link may expire after a short time. If it does, request a
                  new one.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
