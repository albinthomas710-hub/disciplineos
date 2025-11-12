import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, AlertCircle, Users, BarChart3, Calendar, User, Building, Lightbulb, Link as LinkIcon, Clock, Target } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ProblemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: {
    _id: Id<"problems">;
    problemTitle: string;
    problemDescription: string;
    status: string;
    dollarValue: number;
    painLevel: number;
    peopleWhoHaveThis: number;
    priorityScore: number;
    problemCategory: string;
    notes?: string;
    customerName?: string;
    industry?: string;
    discoverySource?: string;
    discoveredDate?: string;
    isPainful?: boolean;
    isUrgent?: boolean;
    isCostly?: boolean;
    is8020Focus?: boolean;
    validationDeadline?: string;
    solutionDeadline?: string;
    deadlineNotes?: string;
    sourceUrl?: string;
    sourceType?: string;
    miningNotes?: string;
  };
  getStatusColor: (status: string) => string;
}

export function ProblemDetailsDialog({ open, onOpenChange, problem, getStatusColor }: ProblemDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{problem.problemTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getStatusColor(problem.status)} variant="default">
              {problem.status}
            </Badge>
            <Badge variant="outline">{problem.problemCategory.replace(/_/g, " ")}</Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Problem Description
            </h3>
            <p className="text-sm text-muted-foreground">{problem.problemDescription}</p>
          </div>

          <Separator />

          {/* Key Metrics */}
          <div>
            <h3 className="font-semibold mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-2xl font-bold">${problem.dollarValue}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
                <AlertCircle className="h-5 w-5 mx-auto mb-1 text-red-600" />
                <p className="text-2xl font-bold">{problem.painLevel}/10</p>
                <p className="text-xs text-muted-foreground">Pain Level</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-bold">{problem.peopleWhoHaveThis}</p>
                <p className="text-xs text-muted-foreground">People Affected</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-2xl font-bold">{Math.round(problem.priorityScore)}</p>
                <p className="text-xs text-muted-foreground">Priority Score</p>
              </div>
            </div>
          </div>

          {/* Pain/Urgency/Cost Framework */}
          {(problem.isPainful || problem.isUrgent || problem.isCostly || problem.is8020Focus) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Pain/Urgency/Cost Framework</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.isPainful && (
                    <Badge className="bg-red-600">😫 Painful (Causes significant pain)</Badge>
                  )}
                  {problem.isUrgent && (
                    <Badge className="bg-orange-600">⚡ Urgent (Needs immediate attention)</Badge>
                  )}
                  {problem.isCostly && (
                    <Badge className="bg-yellow-600">💰 Costly (Significant money/time cost)</Badge>
                  )}
                  {problem.is8020Focus && (
                    <Badge className="bg-purple-600">🎯 80/20 Focus (High-leverage problem)</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Discovery Information */}
          <Separator />
          <div>
            <h3 className="font-semibold mb-3">Discovery Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problem.discoverySource && (
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Discovery Source</p>
                    <p className="text-sm">{problem.discoverySource.replace(/_/g, " ")}</p>
                  </div>
                </div>
              )}
              {problem.discoveredDate && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Discovered Date</p>
                    <p className="text-sm">{new Date(problem.discoveredDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {problem.customerName && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Customer Name</p>
                    <p className="text-sm">{problem.customerName}</p>
                  </div>
                </div>
              )}
              {problem.industry && (
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Industry</p>
                    <p className="text-sm">{problem.industry}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deadlines */}
          {(problem.validationDeadline || problem.solutionDeadline || problem.deadlineNotes) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hard Deadlines
                </h3>
                <div className="space-y-3">
                  {problem.validationDeadline && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Validation Deadline</p>
                      <p className="text-sm">{new Date(problem.validationDeadline).toLocaleDateString()}</p>
                    </div>
                  )}
                  {problem.solutionDeadline && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Solution Ship Deadline</p>
                      <p className="text-sm">{new Date(problem.solutionDeadline).toLocaleDateString()}</p>
                    </div>
                  )}
                  {problem.deadlineNotes && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Deadline Notes</p>
                      <p className="text-sm">{problem.deadlineNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Pain Point Mining */}
          {(problem.sourceUrl || problem.sourceType || problem.miningNotes) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Pain Point Mining
                </h3>
                <div className="space-y-3">
                  {problem.sourceUrl && (
                    <div className="flex items-start gap-2">
                      <LinkIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold mb-1">Source URL</p>
                        <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                          {problem.sourceUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {problem.sourceType && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Source Type</p>
                      <p className="text-sm">{problem.sourceType}</p>
                    </div>
                  )}
                  {problem.miningNotes && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Mining Notes</p>
                      <p className="text-sm">{problem.miningNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Additional Notes */}
          {problem.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
