import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Access your QuickCourt account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const [session, sp] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ]);

  if (session) {
    const callbackUrlParam = Array.isArray(sp?.callbackUrl)
      ? sp.callbackUrl[0]
      : sp?.callbackUrl;

    const callbackUrl =
      callbackUrlParam ??
      (session.user.role === "OWNER" ? "/manager/dashboard" : "/player");

    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 relative">
        <Image
          src="/login.jpg"
          alt="Signup background"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Login to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
