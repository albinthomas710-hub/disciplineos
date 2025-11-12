import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProblemColumnProps {
  title: string;
  problems: any[];
  gradientColor: string;
  borderColor: string;
  getStatusColor: (status: string) => string;
  onDelete?: (problemId: string) => void;
}

export function ProblemColumn({ 
  title, 
  problems, 
  gradientColor, 
  borderColor, 
  getStatusColor,
  onDelete 
}: ProblemColumnProps) {
  return (
    <div className="space-y-3">
      <div className={`bg-gradient-to-r ${gradientColor} text-white p-3 rounded-lg text-center font-bold`}>
        {title} ({problems.length})
      </div>
      <div className="space-y-3">
        {problems.map((problem: any) => (
          <Card key={problem._id} className={`border-2 ${borderColor}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm flex-1">{problem.problemTitle}</h4>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(problem._id)}
                    className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{problem.problemDescription}</p>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(problem.status)} variant="secondary">
                  {problem.status}
                </Badge>
                <span className="text-xs font-semibold text-green-600">
                  ${problem.dollarValue.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Pain: {problem.painLevel}/10 • {problem.peopleWhoHaveThis} people
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}