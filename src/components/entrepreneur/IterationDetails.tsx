import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Zap, CheckCircle2, Clock } from "lucide-react";

interface IterationDetailsProps {
  iteration: any;
  onAddValidation?: () => void;
  onUpdateStatus?: (status: string) => void;
}

export function IterationDetails({ iteration, onAddValidation, onUpdateStatus }: IterationDetailsProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-gray-500",
      building: "bg-blue-500",
      testing: "bg-yellow-500",
      launched: "bg-green-500",
      measuring: "bg-purple-500",
      shipped: "bg-emerald-600",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <Card className="p-6 border-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">{iteration.title}</h3>
            <p className="text-muted-foreground mt-1">{iteration.description}</p>
          </div>
          <Badge className={`${getStatusColor(iteration.status)} text-white`}>
            {iteration.status.toUpperCase()}
          </Badge>
        </div>

        {/* Dates & Complexity */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {iteration.startDate && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">START</p>
                <p className="font-semibold">{iteration.startDate}</p>
              </div>
            </div>
          )}

          {iteration.targetShipDate && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">TARGET</p>
                <p className="font-semibold">{iteration.targetShipDate}</p>
              </div>
            </div>
          )}

          {iteration.actualShipDate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">SHIPPED</p>
                <p className="font-semibold">{iteration.actualShipDate}</p>
              </div>
            </div>
          )}

          {iteration.complexity && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">COMPLEXITY</p>
                <p className="font-semibold">{iteration.complexity}/10</p>
              </div>
            </div>
          )}

          {iteration.daysToShip !== undefined && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <Clock className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">DAYS TO SHIP</p>
                <p className="font-semibold">{iteration.daysToShip} days</p>
              </div>
            </div>
          )}
        </div>

        {/* Hypothesis */}
        {iteration.hypothesis && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">HYPOTHESIS</h4>
            <p className="text-purple-800 dark:text-purple-200">{iteration.hypothesis}</p>
          </div>
        )}

        {/* Changes */}
        {iteration.changes && iteration.changes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">CHANGES</h4>
            <div className="space-y-3">
              {iteration.changes.map((change: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                >
                  <p className="font-medium text-blue-900 dark:text-blue-100">→ {change.change}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    <span className="font-semibold">Reason:</span> {change.reason}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Expected Impact:</span> {change.expectedImpact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learnings */}
        {iteration.learnings && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">LEARNINGS</h4>
            <p className="text-green-800 dark:text-green-200">{iteration.learnings}</p>
          </div>
        )}

        {/* Metrics */}
        {iteration.metrics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {iteration.metrics.beforeSatisfaction !== undefined && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Before</p>
                <p className="text-2xl font-bold">{iteration.metrics.beforeSatisfaction}</p>
              </div>
            )}
            {iteration.metrics.afterSatisfaction !== undefined && (
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">After</p>
                <p className="text-2xl font-bold text-green-600">{iteration.metrics.afterSatisfaction}</p>
              </div>
            )}
            {iteration.metrics.feedbackCount !== undefined && (
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Feedback</p>
                <p className="text-2xl font-bold">{iteration.metrics.feedbackCount}</p>
              </div>
            )}
            {iteration.metrics.positiveResponses !== undefined && (
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Positive</p>
                <p className="text-2xl font-bold text-green-600">{iteration.metrics.positiveResponses}</p>
              </div>
            )}
            {iteration.metrics.negativeResponses !== undefined && (
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Negative</p>
                <p className="text-2xl font-bold text-red-600">{iteration.metrics.negativeResponses}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {iteration.status === "shipped" && onAddValidation && (
            <Button
              onClick={onAddValidation}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
            >
              Add Impact Validation
            </Button>
          )}
          {onUpdateStatus && iteration.status !== "shipped" && (
            <Button
              onClick={() => {
                const nextStatus: Record<string, string> = {
                  planning: "building",
                  building: "testing",
                  testing: "launched",
                  launched: "measuring",
                  measuring: "shipped",
                };
                onUpdateStatus(nextStatus[iteration.status] || "shipped");
              }}
              variant="outline"
              className="hover:shadow-lg transition-shadow"
            >
              Move to {iteration.status === "planning" ? "Building" : iteration.status === "building" ? "Testing" : iteration.status === "testing" ? "Launched" : iteration.status === "launched" ? "Measuring" : "Shipped"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
