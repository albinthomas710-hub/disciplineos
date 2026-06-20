import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  conversationType: string;
  setConversationType: (value: string) => void;
  exactQuotes: string;
  setExactQuotes: (value: string) => void;
  painPoints: string;
  setPainPoints: (value: string) => void;
  dollarImpact: number;
  setDollarImpact: (value: number) => void;
  industryInsights: string;
  setIndustryInsights: (value: string) => void;
}

export function LearningFormDialog(props: LearningFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
            <Label>Conversation Type</Label>
            <Select value={props.conversationType} onValueChange={props.setConversationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discovery_call">Discovery Call</SelectItem>
                <SelectItem value="interview">Customer Interview</SelectItem>
                <SelectItem value="feedback_session">Feedback Session</SelectItem>
                <SelectItem value="support">Support Conversation</SelectItem>
                <SelectItem value="casual">Casual Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-sm">📋 Real Problems Discovered</h4>
            <Textarea
              value={props.problemsDiscovered}
              onChange={(e) => props.setProblemsDiscovered(e.target.value)}
              placeholder="What specific problems did you discover? Be concrete and detailed..."
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-sm">💬 Exact Customer Quotes</h4>
            <Textarea
              value={props.exactQuotes}
              onChange={(e) => props.setExactQuotes(e.target.value)}
              placeholder="Capture their exact words - these are gold! e.g., 'I waste 3 hours every day on this...'"
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-sm">😫 Pain Points & What They Actually Need</h4>
            <Textarea
              value={props.painPoints}
              onChange={(e) => props.setPainPoints(e.target.value)}
              placeholder="Separate with commas: time wasted, money lost, frustration with current tools, etc."
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-sm">🏭 Industry Knowledge & Market Insights</h4>
            <Textarea
              value={props.industryInsights}
              onChange={(e) => props.setIndustryInsights(e.target.value)}
              placeholder="What did you learn about their industry, market trends, competitors, or how they operate?"
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <Label>💰 Dollar Impact (if mentioned)</Label>
            <Input
              type="number"
              min="0"
              value={props.dollarImpact || ""}
              onChange={(e) => props.setDollarImpact(parseInt(e.target.value) || 0)}
              placeholder="How much does this problem cost them? ($/month or $/year)"
            />
          </div>

          <div className="flex gap-2 pt-4">
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