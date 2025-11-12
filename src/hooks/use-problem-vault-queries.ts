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

export function useDeleteProblem() {
  const apiRef = (api as any).problemVault.deleteProblem;
  return useMutation(apiRef);
}

export function useDeleteSolution() {
  const apiRef = (api as any).problemVault.deleteSolution;
  return useMutation(apiRef);
}

export function useDeleteLearning() {
  const apiRef = (api as any).problemVault.deleteCustomerLearning;
  return useMutation(apiRef);
}

export function useDeletePivot() {
  const apiRef = (api as any).problemVault.deletePivot;
  return useMutation(apiRef);
}

export function useDeleteFailure() {
  const apiRef = (api as any).problemVault.deleteFailure;
  return useMutation(apiRef);
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

// 80/20 Focus System Hooks
export function useAllActivities() {
  const apiRef = (api as any).eightyTwenty.getAllActivities;
  return useQuery(apiRef);
}

export function useTopPerformers() {
  const apiRef = (api as any).eightyTwenty.getTopPerformers;
  return useQuery(apiRef);
}

export function useEightyTwentyInsights() {
  const apiRef = (api as any).eightyTwenty.getInsights;
  return useQuery(apiRef);
}

export function useCreateActivity() {
  return useMutation((api as any).eightyTwenty.createActivity);
}

export function useLogResult() {
  return useMutation((api as any).eightyTwenty.logResult);
}

export function useUpdateActivityStatus() {
  return useMutation((api as any).eightyTwenty.updateActivityStatus);
}

export function useDeleteActivity() {
  return useMutation((api as any).eightyTwenty.deleteActivity);
}