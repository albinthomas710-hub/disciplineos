import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  allProblems: any[];
  selectedProblemId: string;
  setSelectedProblemId: (id: string) => void;
  solutionTitle: string;
  setSolutionTitle: (title: string) => void;
  solutionDescription: string;
  setSolutionDescription: (desc: string) => void;
  hypothesis: string;
  setHypothesis: (hyp: string) => void;
  expectedOutcome: string;
  setExpectedOutcome: (outcome: string) => void;
  buildComplexity: number;
  setBuildComplexity: (complexity: number) => void;
  timeToBuild: number;
  setTimeToBuild: (time: number) => void;
  status: string;
  setStatus: (status: string) => void;
}

export function SolutionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  allProblems,
  selectedProblemId,
  setSelectedProblemId,
  solutionTitle,
  setSolutionTitle,
  solutionDescription,
  setSolutionDescription,
  hypothesis,
  setHypothesis,
  expectedOutcome,
  setExpectedOutcome,
  buildComplexity,
  setBuildComplexity,
  timeToBuild,
  setTimeToBuild,
  status,
  setStatus,
}: SolutionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Solution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Problem *</Label>
            <Select value={selectedProblemId} onValueChange={setSelectedProblemId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a problem to solve" />
              </SelectTrigger>
              <SelectContent>
                {allProblems.map((problem: any) => (
                  <SelectItem key={problem._id} value={problem._id}>
                    {problem.problemTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Solution Title *</Label>
            <Input
              value={solutionTitle}
              onChange={(e) => setSolutionTitle(e.target.value)}
              placeholder="e.g., Automated data entry system"
            />
          </div>

          <div>
            <Label>Solution Description *</Label>
            <Textarea
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              placeholder="Describe your solution approach..."
              rows={3}
            />
          </div>

          <div>
            <Label>Hypothesis *</Label>
            <Textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="What do you believe will happen when you implement this?"
              rows={2}
            />
          </div>

          <div>
            <Label>Expected Outcome *</Label>
            <Textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="What results do you expect?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Build Complexity (1-10): {buildComplexity}</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={buildComplexity}
                onChange={(e) => setBuildComplexity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <Label>Time to Build (days)</Label>
              <Input
                type="number"
                min="0"
                value={timeToBuild || ""}
                onChange={(e) => setTimeToBuild(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">💡 Idea</SelectItem>
                <SelectItem value="building">🔨 Building</SelectItem>
                <SelectItem value="testing">🧪 Testing</SelectItem>
                <SelectItem value="shipped">🚀 Shipped</SelectItem>
                <SelectItem value="validated">✅ Validated</SelectItem>
                <SelectItem value="failed">❌ Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Add Solution
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
