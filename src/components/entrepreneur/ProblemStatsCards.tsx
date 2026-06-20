import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Target, TrendingUp, CheckCircle2, Zap } from "lucide-react";

interface ProblemStatsCardsProps {
  stats: {
    totalProblems: number;
    bigOpportunities: number;
    roiFocusProblems: number;
    problemsValidated: number;
    solutionsShipped: number;
  } | null | undefined;
}

export function ProblemStatsCards({ stats }: ProblemStatsCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardContent className="pt-6">
          <div className="text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-3xl font-bold">{stats?.totalProblems || 0}</p>
            <p className="text-sm text-muted-foreground">Total Problems</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardContent className="pt-6">
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-3xl font-bold">{stats?.bigOpportunities || 0}</p>
            <p className="text-sm text-muted-foreground">Big $10M+</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardContent className="pt-6">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold">{stats?.roiFocusProblems || 0}</p>
            <p className="text-sm text-muted-foreground">ROI Focus</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{stats?.problemsValidated || 0}</p>
            <p className="text-sm text-muted-foreground">Validated</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
        <CardContent className="pt-6">
          <div className="text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-3xl font-bold">{stats?.solutionsShipped || 0}</p>
            <p className="text-sm text-muted-foreground">Solutions Shipped</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
