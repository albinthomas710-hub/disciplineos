import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface FailureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  failureDate: string;
  setFailureDate: (value: string) => void;
  whatFailed: string;
  setWhatFailed: (value: string) => void;
  whyItFailed: string;
  setWhyItFailed: (value: string) => void;
  costOfFailure: number;
  setCostOfFailure: (value: number) => void;
  lessonLearned: string;
  setLessonLearned: (value: string) => void;
  whatToDoDifferently: string;
  setWhatToDoDifferently: (value: string) => void;
  patternCategory: string;
  setPatternCategory: (value: string) => void;
}

export function FailureFormDialog(props: FailureFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Failure</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={props.failureDate}
                onChange={(e) => props.setFailureDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Pattern Category</Label>
              <Select value={props.patternCategory} onValueChange={props.setPatternCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wrong_problem">Wrong Problem</SelectItem>
                  <SelectItem value="wrong_solution">Wrong Solution</SelectItem>
                  <SelectItem value="wrong_timing">Wrong Timing</SelectItem>
                  <SelectItem value="wrong_customer">Wrong Customer</SelectItem>
                  <SelectItem value="wrong_niche">Wrong Niche</SelectItem>
                  <SelectItem value="poor_execution">Poor Execution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>What Failed *</Label>
            <Input
              value={props.whatFailed}
              onChange={(e) => props.setWhatFailed(e.target.value)}
              placeholder="Brief description of what failed"
            />
          </div>
          <div>
            <Label>Why It Failed *</Label>
            <Textarea
              value={props.whyItFailed}
              onChange={(e) => props.setWhyItFailed(e.target.value)}
              placeholder="Root cause analysis"
              rows={3}
            />
          </div>
          <div>
            <Label>Cost of Failure ($)</Label>
            <Input
              type="number"
              min="0"
              value={props.costOfFailure || ""}
              onChange={(e) => props.setCostOfFailure(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Lesson Learned *</Label>
            <Textarea
              value={props.lessonLearned}
              onChange={(e) => props.setLessonLearned(e.target.value)}
              placeholder="What did you learn from this?"
              rows={3}
            />
          </div>
          <div>
            <Label>What To Do Differently</Label>
            <Textarea
              value={props.whatToDoDifferently}
              onChange={(e) => props.setWhatToDoDifferently(e.target.value)}
              placeholder="How will you approach this differently next time?"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={props.onSubmit}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Document Failure
            </Button>
            <Button variant="outline" onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
