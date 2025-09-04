"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const userLinks = [
    { href: "/", label: "Home" },
    { href: "/venues", label: "Venues" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const managerLinks = [
    { href: "/manager/dashboard", label: "Dashboard" },
    { href: "/manager/my-venues", label: "My Venues" },
    { href: "/manager/bookings", label: "Bookings" },
    { href: "/manager/earnings", label: "Earnings" },
  ];

  const isManager = role === "OWNER" || role === "ADMIN";
  const links = isManager ? managerLinks : userLinks;

  useEffect(() => setOpen(false), [pathname]);

  const AuthButtons = ({ mobile }: { mobile?: boolean }) => {
    if (isLoading) {
      return <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />;
    }
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 focus:outline-none cursor-pointer">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user.image ?? ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="font-medium">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  isManager ? "/manager/dashboard" : "/player/profile"
                )
              }
              className="cursor-pointer font-medium"
            >
              {isManager ? "Dashboard" : "Profile"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(isManager ? "/manager/profile" : "/player/settings")
              }
              className="cursor-pointer font-medium"
            >
              {isManager ? "Profile" : "Settings"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout?.()}
              className="text-red-600 cursor-pointer font-medium"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <div className={cn("flex gap-2", mobile && "flex-col")}>
        <Link href="/login">
          <Button
            className={cn("rounded-full cursor-pointer", mobile && "w-full")}
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            variant="outline"
            className={cn("rounded-full cursor-pointer", mobile && "w-full")}
          >
            Signup
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold shadow">
            QC
          </span>
          <span className="text-xl font-semibold text-foreground">
            QuickCourt
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
              }
            />
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          <AuthButtons />
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border text-foreground hover:bg-accent"
          onClick={() => setOpen((s) => !s)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor">
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-top bg-background"
          >
            <div className="px-4 py-3 space-y-2">
              {links.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                  }
                />
              ))}
              <div className="pt-2 border-t mt-2">
                <AuthButtons mobile />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
