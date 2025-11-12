import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertCircle, Users, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface ProblemCardProps {
  problem: {
    _id: Id<"problems">;
    problemTitle: string;
    problemDescription: string;
    status: string;
    dollarValue: number;
    painLevel: number;
    peopleWhoHaveThis: number;
    priorityScore: number;
  };
  borderColor: string;
  getStatusColor: (status: string) => string;
}

export function ProblemCard({ problem, borderColor, getStatusColor }: ProblemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`border-2 ${borderColor} hover:shadow-lg transition-all`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-bold text-sm">{problem.problemTitle}</h4>
            <Badge className={getStatusColor(problem.status)} variant="default">
              {problem.status}
            </Badge>
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
