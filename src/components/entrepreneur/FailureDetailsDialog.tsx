import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { XCircle, Calendar, DollarSign, Lightbulb, AlertTriangle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface FailureDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failure: {
    _id: string;
    failureDate: string;
    whatFailed: string;
    whyItFailed: string;
    costOfFailure?: number;
    lessonLearned: string;
    whatToDoDifferently: string;
    patternCategory: string;
  };
}

export function FailureDetailsDialog({ open, onOpenChange, failure }: FailureDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-600" />
            {failure.whatFailed}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category and Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-red-600">{failure.patternCategory.replace(/_/g, " ")}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(failure.failureDate).toLocaleDateString()}
            </div>
          </div>

          <Separator />

          {/* Why It Failed */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Why It Failed
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{failure.whyItFailed}</p>
          </div>

          <Separator />

          {/* Cost of Failure */}
          {failure.costOfFailure && failure.costOfFailure > 0 && (
            <>
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold">Cost of Failure</h3>
                </div>
                <p className="text-2xl font-bold text-red-600">${failure.costOfFailure.toLocaleString()}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Lesson Learned */}
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-600">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Lesson Learned</h3>
            </div>
            <p className="text-sm whitespace-pre-wrap">{failure.lessonLearned}</p>
          </div>

          <Separator />

          {/* What To Do Differently */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-600">
            <h3 className="font-semibold mb-2">What To Do Differently Next Time</h3>
            <p className="text-sm whitespace-pre-wrap">{failure.whatToDoDifferently}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
