import { ProblemCard } from "./ProblemCard";
import { Id } from "@/convex/_generated/dataModel";

interface Problem {
  _id: Id<"problems">;
  problemTitle: string;
  problemDescription: string;
  status: string;
  dollarValue: number;
  painLevel: number;
  peopleWhoHaveThis: number;
  priorityScore: number;
}

interface ProblemColumnProps {
  title: string;
  problems: Problem[];
  gradientColor: string;
  borderColor: string;
  getStatusColor: (status: string) => string;
}

export function ProblemColumn({ title, problems, gradientColor, borderColor, getStatusColor }: ProblemColumnProps) {
  return (
    <div className="space-y-3">
      <div className={`bg-gradient-to-r ${gradientColor} p-4 rounded-lg text-white text-center`}>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm opacity-90">{problems.length} problems</p>
      </div>
      {problems.map((problem) => (
        <ProblemCard
          key={problem._id}
          problem={problem}
          borderColor={borderColor}
          getStatusColor={getStatusColor}
        />
      ))}
    </div>
  );
}
