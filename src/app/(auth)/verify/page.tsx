"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { VerifyOtpSchema, verifyOtpSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const form = useForm<VerifyOtpSchema>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (emailFromQuery) form.setValue("email", emailFromQuery);
  }, [emailFromQuery, form]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function onSubmit(values: z.infer<typeof verifyOtpSchema>) {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to verify OTP");
      }
      toast.success("Account verified successfully!");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    try {
      if (!form.getValues("email")) {
        toast.error("Missing email to resend OTP");
        return;
      }
      setCooldown(60);
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.getValues("email") }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to resend OTP");
      }
      toast.success("OTP resent. Check inbox/spam.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to resend OTP");
      setCooldown(0);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 relative">
        <Image src="/otp.jpg" alt="Verify OTP" fill className="object-cover" />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-background/95 p-6 shadow-sm backdrop-blur">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code sent to the email below.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input
                      {...field}
                      readOnly
                      className="bg-muted/50 font-medium"
                    />
                    <FormDescription className="mt-1">
                      Can’t access this email? Return to sign up to change it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter One-time code</FormLabel>
                    <div className="flex flex-col items-center gap-3">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        pattern="\d*"
                        containerClassName="justify-center"
                      >
                        <InputOTPGroup>
                          {[0, 1, 2].map((i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="h-12 w-12 text-lg"
                            />
                          ))}
                        </InputOTPGroup>
                        <InputOTPGroup>
                          {[3, 4, 5].map((i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="h-12 w-12 text-lg"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                      <p className="text-xs text-muted-foreground">
                        Didn’t get the code?{" "}
                        <button
                          type="button"
                          onClick={resendOtp}
                          disabled={cooldown > 0}
                          className="underline underline-offset-4 disabled:opacity-50 cursor-pointer hover:text-green-500"
                        >
                          Resend{cooldown > 0 ? ` in ${cooldown}s` : ""}
                        </button>
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full cursor-pointer"
                size="lg"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By continuing, this device may be marked as trusted.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
