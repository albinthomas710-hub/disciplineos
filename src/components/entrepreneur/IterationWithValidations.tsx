import { IterationCard } from "./IterationCard";

interface IterationWithValidationsProps {
  iteration: any;
  allFeedback: any[];
  onAddValidation: () => void;
  onUpdateStatus: (status: string) => void;
  onDelete?: (iterationId: string) => void;
}

export function IterationWithValidations({
  iteration,
  allFeedback,
  onAddValidation,
  onUpdateStatus,
  onDelete,
}: IterationWithValidationsProps) {
  return (
    <IterationCard
      iteration={iteration}
      allFeedback={allFeedback}
      onAddValidation={onAddValidation}
      onUpdateStatus={onUpdateStatus}
      onDelete={onDelete}
    />
  );
}