import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Wrapper hooks to avoid TypeScript's deep type instantiation issues
// We use any types throughout to bypass Convex's complex type inference
export function useAllProblems(): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return query(apiModule.problemVault.getAllProblems);
}

export function useProblemStats(): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return query(apiModule.problemVault.getProblemStats);
}

export function useAllCustomerLearnings(): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return query(apiModule.problemVault.getAllCustomerLearnings);
}

export function useAllPivots(): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return query(apiModule.problemVault.getAllPivots);
}

export function useAllFailures(): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return query(apiModule.problemVault.getAllFailures);
}

