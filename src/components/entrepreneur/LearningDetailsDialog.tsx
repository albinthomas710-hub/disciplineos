import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Calendar, DollarSign, User, Quote, AlertCircle, Building } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface LearningDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learning: {
    _id: Id<"customerLearnings">;
    date: string;
    customerName: string;
    conversationType: string;
    problemsDiscovered: string;
    exactQuotes?: string;
    painPoints?: string[];
    dollarImpact?: number;
    industryInsights?: string;
  };
}

export function LearningDetailsDialog({ open, onOpenChange, learning }: LearningDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Customer Learning: {learning.customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conversation Type and Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-blue-600">{learning.conversationType.replace(/_/g, " ")}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(learning.date).toLocaleDateString()}
            </div>
          </div>

          <Separator />

          {/* Customer Name */}
          <div className="flex items-start gap-2">
            <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold">Customer Name</p>
              <p className="text-lg font-medium">{learning.customerName}</p>
            </div>
          </div>

          <Separator />

          {/* Problems Discovered */}
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-l-4 border-red-600">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold">Problems Discovered</h3>
            </div>
            <p className="text-sm whitespace-pre-wrap">{learning.problemsDiscovered}</p>
          </div>

          {/* Exact Quotes */}
          {learning.exactQuotes && (
            <>
              <Separator />
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-l-4 border-yellow-600">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold">Customer Quote</h3>
                </div>
                <p className="text-sm italic whitespace-pre-wrap">&quot;{learning.exactQuotes}&quot;</p>
              </div>
            </>
          )}

          {/* Pain Points */}
          {learning.painPoints && learning.painPoints.length > 0 && (
            <>
              <Separator />
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-l-4 border-orange-600">
                <h3 className="font-semibold mb-3">😫 Pain Points</h3>
                <div className="flex flex-wrap gap-2">
                  {learning.painPoints.map((point: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dollar Impact */}
          {learning.dollarImpact && learning.dollarImpact > 0 && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Dollar Impact</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">${learning.dollarImpact.toLocaleString()}</p>
              </div>
            </>
          )}

          {/* Industry Insights */}
          {learning.industryInsights && (
            <>
              <Separator />
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-l-4 border-purple-600">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Industry Insights</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{learning.industryInsights}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
