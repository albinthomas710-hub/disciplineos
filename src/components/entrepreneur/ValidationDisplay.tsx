import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, DollarSign, Timer, Quote } from "lucide-react";

interface ValidationDisplayProps {
  validation: any;
  originalFeedback?: any;
}

export function ValidationDisplay({ validation, originalFeedback }: ValidationDisplayProps) {
  const getProblemSolvedIcon = (status: string) => {
    if (status === "yes_confirmed") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "no_still_issues") return <XCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getProblemSolvedColor = (status: string) => {
    if (status === "yes_confirmed") return "bg-green-100 dark:bg-green-950 border-green-500";
    if (status === "no_still_issues") return "bg-red-100 dark:bg-red-950 border-red-500";
    return "bg-yellow-100 dark:bg-yellow-950 border-yellow-500";
  };

  const getNextActionColor = (action: string) => {
    if (action === "mark_resolved") return "bg-green-600";
    if (action === "needs_additional_iteration") return "bg-orange-600";
    return "bg-blue-600";
  };

  return (
    <Card className="p-6 border-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-300">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">Impact Validation</h3>
          <Badge className={getNextActionColor(validation.nextAction)}>
            {validation.nextAction.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>

        {/* Problem Solved Status */}
        <div className={`p-4 rounded-lg border-l-4 ${getProblemSolvedColor(validation.problemSolved)}`}>
          <div className="flex items-center gap-3">
            {getProblemSolvedIcon(validation.problemSolved)}
            <div>
              <p className="font-semibold">Problem Resolution</p>
              <p className="text-sm">
                {validation.problemSolved === "yes_confirmed" && "✅ Confirmed Fixed"}
                {validation.problemSolved === "no_still_issues" && "❌ Still Has Issues"}
                {validation.problemSolved === "not_tested_yet" && "⏳ Not Tested Yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Satisfaction Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {originalFeedback && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Before Satisfaction</p>
              <p className="text-3xl font-bold">{originalFeedback.satisfactionScore}/10</p>
            </div>
          )}
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">After Satisfaction</p>
            <p className="text-3xl font-bold text-green-600">{validation.postSatisfaction}/10</p>
          </div>
        </div>

        {/* Measurable Impact */}
        <div className="space-y-3">
          <h4 className="font-semibold">Measurable Impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {validation.timeSaved !== undefined && validation.timeSaved > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Timer className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                  <p className="font-bold text-blue-600">{validation.timeSaved} hours/week</p>
                </div>
              </div>
            )}

            {validation.revenueGained !== undefined && validation.revenueGained > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Gained</p>
                  <p className="font-bold text-green-600">${validation.revenueGained.toLocaleString()}</p>
                </div>
              </div>
            )}

            {validation.iterationFailed && (
              <div className="col-span-full p-3 bg-red-50 dark:bg-red-950 rounded-lg border-l-4 border-red-500">
                <p className="font-semibold text-red-900 dark:text-red-100">⚠️ Iteration Failed</p>
                <p className="text-sm text-red-700 dark:text-red-300">This iteration did not achieve the expected results</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Quote */}
        {validation.customerQuote && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-start gap-3">
              <Quote className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Customer Quote</p>
                <p className="text-purple-800 dark:text-purple-200 italic">"{validation.customerQuote}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Date */}
        <div className="text-sm text-muted-foreground text-right">
          Validated on {new Date(validation.validatedAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}
