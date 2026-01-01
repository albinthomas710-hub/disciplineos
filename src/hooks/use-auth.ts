import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  
  // FIX: Do not call hooks conditionally. Use "skip" to conditionally fetch.
  // If not authenticated, pass "skip" to useQuery.
  const user = useQuery((api as any).users.currentUser, isAuthenticated ? {} : "skip");

  return {
    isLoading: isLoading || (isAuthenticated && user === undefined),
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}