import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery((api as any).users.currentUser);
  const { signIn, signOut } = useAuthActions();

  // Derive loading state directly to prevent infinite loops from useEffect/useState
  // We are loading if:
  // 1. Convex auth is initializing
  // 2. We are authenticated but user data hasn't loaded yet (user === undefined)
  const isLoading = isAuthLoading || (isAuthenticated && user === undefined);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}