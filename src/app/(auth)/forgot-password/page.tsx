"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation";
import { z } from "zod";
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
import Link from "next/link";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success("If that email exists, a reset link has been sent.");
    } catch {
      toast.error("Error sending reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
      {/* Left side image */}
      <div className="relative hidden lg:block">
        <Image
          src="/otp-image.jpg"
          alt="Forgot Password"
          fill
          priority
          className="object-cover"
        />
        {/* Optional overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent" />
      </div>

      {/* Right side form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Forgot Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the email used for the account.
            </p>
          </div>

          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  A link to reset the password will be sent if the email is
                  registered.
                </p>
              </form>
            </Form>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="underline hover:text-foreground">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
