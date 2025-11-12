import { useQuery, useMutation } from "convex/react";
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

// Solution wrappers
export function useAllSolutions(): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return query(apiModule.problemVault.getAllSolutions);
}

export function useSolutionsForProblem(problemId: string | null): any {
  const query: any = useQuery;
  const apiModule: any = api;
  return problemId ? query(apiModule.problemVault.getSolutionsForProblem, { problemId }) : undefined;
}

export function useCreateSolution(): any {
  const mutation: any = useMutation;
  const apiModule: any = api;
  return mutation(apiModule.problemVault.createSolution);
}

// Mutation wrappers
export function useCreateProblem(): any {
  const mutation: any = useMutation;
  const apiModule: any = api;
  return mutation(apiModule.problemVault.createProblem);
}

export function useCreateLearning(): any {
  const mutation: any = useMutation;
  const apiModule: any = api;
  return mutation(apiModule.problemVault.createCustomerLearning);
}

export function useCreatePivot(): any {
  const mutation: any = useMutation;
  const apiModule: any = api;
  return mutation(apiModule.problemVault.createPivot);
}

export function useCreateFailure(): any {
  const mutation: any = useMutation;
  const apiModule: any = api;
  return mutation(apiModule.problemVault.createFailure);
}

// Hard Deadlines Wrappers
export function useAllDeadlines() {
  const apiRef = (api as any).hardDeadlines.getAllDeadlines;
  return useQuery(apiRef);
}

export function useActiveDeadlines() {
  const apiRef = (api as any).hardDeadlines.getActiveDeadlines;
  return useQuery(apiRef);
}

export function useOverdueDeadlines() {
  const apiRef = (api as any).hardDeadlines.getOverdueDeadlines;
  return useQuery(apiRef);
}

export function useDeadlineStats() {
  const apiRef = (api as any).hardDeadlines.getDeadlineStats;
  return useQuery(apiRef);
}

export function useCreateDeadline() {
  const apiRef = (api as any).hardDeadlines.createDeadline;
  return useMutation(apiRef);
}

export function useCompleteDeadline() {
  const apiRef = (api as any).hardDeadlines.completeDeadline;
  return useMutation(apiRef);
}

export function useMissDeadline() {
  const apiRef = (api as any).hardDeadlines.missDeadline;
  return useMutation(apiRef);
}

export function useExtendDeadline() {
  const apiRef = (api as any).hardDeadlines.extendDeadline;
  return useMutation(apiRef);
}

export function useDeleteDeadline() {
  const apiRef = (api as any).hardDeadlines.deleteDeadline;
  return useMutation(apiRef);
}