"use client";

import { useSession, signOut } from "next-auth/react";

/**
 * Custom hook to manage authentication state
 * - Returns session data
 * - Provides login/logout helpers
 * - Tells if user is authenticated, loading, or unauthenticated
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isUnauthenticated = status === "unauthenticated";

  const userRole = session?.user?.role || session?.role || null;

  return {
    user: session?.user || null,
    role: userRole,
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    logout: () => signOut(),
  };
}
