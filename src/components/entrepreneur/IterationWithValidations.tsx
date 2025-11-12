import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IterationDetails } from "./IterationDetails";
import { ValidationDisplay } from "./ValidationDisplay";
import { CheckCircle2 } from "lucide-react";

interface IterationWithValidationsProps {
  iteration: any;
  allFeedback: any[];
  onAddValidation: () => void;
  onUpdateStatus: (status: string) => void;
}

export function IterationWithValidations({
  iteration,
  allFeedback,
  onAddValidation,
  onUpdateStatus,
}: IterationWithValidationsProps) {
  const validations = useQuery(
    (api as any).impactValidation.getValidationsByIteration,
    { iterationId: iteration._id }
  );

  return (
    <div className="space-y-4">
      <IterationDetails
        iteration={iteration}
        onAddValidation={onAddValidation}
        onUpdateStatus={onUpdateStatus}
      />

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
