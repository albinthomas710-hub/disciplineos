import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery((api as any).users.currentUser);
  const { signIn, signOut } = useAuthActions();

  const [isLoading, setIsLoading] = useState(true);

  // This effect updates the loading state once auth is loaded and user data is available
  // It ensures we only show content when both authentication state and user data are ready
  useEffect(() => {
    if (!isAuthLoading) {
      // Only check if auth is loaded, don't depend on user to prevent infinite loops
      // User can be undefined for unauthenticated users
      setIsLoading(false);
    }
  }, [isAuthLoading]); // Removed 'user' from dependencies to prevent infinite loop

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}