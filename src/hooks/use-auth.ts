import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  
  // FIX: Do not call hooks conditionally. Use "skip" to conditionally fetch.
  // If not authenticated, pass "skip" to useQuery.
  const user = useQuery(isAuthenticated ? (api as any).users.currentUser : "skip");
  
  const { signIn, signOut } = useAuthActions();

  // Derive loading state directly
  // We are loading if:
  // 1. Convex auth is initializing
  // 2. We are authenticated but user data hasn't loaded yet (user === undefined)
  // Note: When passing "skip", useQuery returns undefined, but we know we are not authenticated so we don't wait for user.
  const isLoading = isAuthLoading || (isAuthenticated && user === undefined);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}