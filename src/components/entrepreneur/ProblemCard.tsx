import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertCircle, Users, BarChart3, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface ProblemCardProps {
  problem: {
    _id: string;
    problemTitle: string;
    problemDescription: string;
    status: string;
    dollarValue: number;
    painLevel: number;
    peopleWhoHaveThis: number;
    priorityScore: number;
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
  borderColor: string;
  getStatusColor: (status: string) => string;
  onDelete?: (problemId: string) => void;
  onViewDetails?: (problemId: string) => void;
}

export function ProblemCard({ problem, borderColor, getStatusColor, onDelete, onViewDetails }: ProblemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`border-2 ${borderColor} hover:shadow-lg transition-all`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-sm flex-1">{problem.problemTitle}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge className={getStatusColor(problem.status)} variant="default">
                {problem.status}
              </Badge>
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(problem._id)}
                  className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                  title="View full details"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(problem._id)}
                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  title="Delete problem"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{problem.problemDescription}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-semibold">${problem.dollarValue}/mo</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="font-semibold">{problem.painLevel}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-blue-600" />
              <span className="font-semibold">{problem.peopleWhoHaveThis}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-purple-600" />
              <span className="font-semibold">{Math.round(problem.priorityScore)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}