import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface LearningFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  learningDate: string;
  setLearningDate: (value: string) => void;
  learningCustomer: string;
  setLearningCustomer: (value: string) => void;
  problemsDiscovered: string;
  setProblemsDiscovered: (value: string) => void;
}

export function LearningFormDialog(props: LearningFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Customer Learning</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={props.learningCustomer}
                onChange={(e) => props.setLearningCustomer(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={props.learningDate}
                onChange={(e) => props.setLearningDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Problems Discovered *</Label>
            <Textarea
              value={props.problemsDiscovered}
              onChange={(e) => props.setProblemsDiscovered(e.target.value)}
              placeholder="What problems did you discover?"
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={props.onSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Learning
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
