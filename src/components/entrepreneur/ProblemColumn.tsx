import { ProblemCard } from "./ProblemCard";

interface ProblemColumnProps {
  title: string;
  problems: any[];
  gradientColor: string;
  borderColor: string;
  getStatusColor: (status: string) => string;
  onDelete?: (problemId: string) => void;
  onViewDetails?: (problemId: string) => void;
}

export function ProblemColumn({ 
  title, 
  problems, 
  gradientColor, 
  borderColor, 
  getStatusColor, 
  onDelete,
  onViewDetails 
}: ProblemColumnProps) {
  return (
    <div className="space-y-3">
      <div className={`bg-gradient-to-r ${gradientColor} text-white p-3 rounded-lg text-center`}>
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs opacity-90">({problems.length})</p>
      </div>
      <div className="space-y-2">
        {problems.map((problem: any) => (
          <ProblemCard
            key={problem._id}
            problem={problem}
            borderColor={borderColor}
            getStatusColor={getStatusColor}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}