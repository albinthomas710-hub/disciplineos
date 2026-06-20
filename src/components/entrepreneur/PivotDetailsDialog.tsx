import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Calendar, ArrowRight, Lightbulb, Target } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface PivotDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pivot: {
    _id: Id<"pivotLog">;
    pivotDate: string;
    pivotType: string;
    fromWhat: string;
    toWhat: string;
    whyPivoting: string;
    trigger: string;
    evidence: string;
    expectedImpact: string;
  };
}

export function PivotDetailsDialog({ open, onOpenChange, pivot }: PivotDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Strategic Pivot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pivot Type and Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-orange-600">{pivot.pivotType.replace(/_/g, " ")}</Badge>
            <Badge variant="outline">{pivot.trigger.replace(/_/g, " ")}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(pivot.pivotDate).toLocaleDateString()}
            </div>
          </div>

          <Separator />

          {/* From/To Transition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-l-4 border-red-600">
              <h3 className="font-semibold mb-2 text-sm">FROM:</h3>
              <p className="text-sm whitespace-pre-wrap">{pivot.fromWhat}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-600">
              <h3 className="font-semibold mb-2 text-sm">TO:</h3>
              <p className="text-sm whitespace-pre-wrap">{pivot.toWhat}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-8 w-8 text-orange-600" />
          </div>

          <Separator />

          {/* Why Pivoting */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-l-4 border-yellow-600">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">Why We're Pivoting</h3>
            </div>
            <p className="text-sm whitespace-pre-wrap">{pivot.whyPivoting}</p>
          </div>

          <Separator />

          {/* Evidence */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-600">
            <h3 className="font-semibold mb-2">Evidence Supporting This Pivot</h3>
            <p className="text-sm whitespace-pre-wrap">{pivot.evidence}</p>
          </div>

          <Separator />

          {/* Expected Impact */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-l-4 border-purple-600">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Expected Impact</h3>
            </div>
            <p className="text-sm whitespace-pre-wrap">{pivot.expectedImpact}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
