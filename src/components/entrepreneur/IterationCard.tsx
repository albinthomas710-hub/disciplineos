import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IterationDetails } from "./IterationDetails";
import { ValidationDisplay } from "./ValidationDisplay";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IterationCardProps {
  iteration: any;
  allFeedback: any[];
  onAddValidation: () => void;
  onUpdateStatus: (status: string) => void;
  onDelete?: (iterationId: string) => void;
}

export function IterationCard({ 
  iteration, 
  allFeedback, 
  onAddValidation, 
  onUpdateStatus,
  onDelete 
}: IterationCardProps) {
  const validations = useQuery(
    (api as any).impactValidation.getValidationsByIteration,
    { iterationId: iteration._id }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <IterationDetails
            iteration={iteration}
            onAddValidation={onAddValidation}
            onUpdateStatus={onUpdateStatus}
          />
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(iteration._id)}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Display Validations */}
      {validations && validations.length > 0 && (
        <div className="ml-8 space-y-3">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Impact Validations ({validations.length})
          </h4>
          {validations.map((validation: any) => {
            const originalFeedback = allFeedback?.find((f: any) => f._id === validation.feedbackId);
            return (
              <ValidationDisplay
                key={validation._id}
                validation={validation}
                originalFeedback={originalFeedback}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}