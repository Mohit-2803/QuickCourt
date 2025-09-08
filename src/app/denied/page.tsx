import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, Home, LogIn, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DeniedPage() {
  return (
    <main className="min-h-[80vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <div className="relative h-72 w-full bg-muted">
            <Image
              src="/denied.jpg"
              alt="Access denied illustration"
              fill
              className="object-cover"
              priority
            />
          </div>

          <CardContent className="p-8 md:p-10">
            <header className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600/10 text-orange-600 ring-1 ring-orange-700/20 md:hidden">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Access denied
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  This account doesn’t have permission to view this page. If
                  this is unexpected, try signing in with a different account or
                  contact support.
                </p>
              </div>
            </header>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button asChild variant="outline" className="justify-center">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-center">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign in
                </Link>
              </Button>

              <Button
                asChild
                className="bg-orange-600 hover:bg-orange-700 text-white justify-center"
              >
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  Contact support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Error 403 • Insufficient permissions
        </p>
      </div>
    </main>
  );
}
