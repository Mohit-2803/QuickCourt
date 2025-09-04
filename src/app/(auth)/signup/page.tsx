import Image from "next/image";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Signup",
  description: "Create a new account on QuickCourt.",
};

export default function SignupPage() {
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
              Create an Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
