import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface PivotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  pivotDate: string;
  setPivotDate: (value: string) => void;
  pivotType: string;
  setPivotType: (value: string) => void;
  fromWhat: string;
  setFromWhat: (value: string) => void;
  toWhat: string;
  setToWhat: (value: string) => void;
  whyPivoting: string;
  setWhyPivoting: (value: string) => void;
  trigger: string;
  setTrigger: (value: string) => void;
  evidence: string;
  setEvidence: (value: string) => void;
  expectedImpact: string;
  setExpectedImpact: (value: string) => void;
}

export function PivotFormDialog(props: PivotFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Strategic Pivot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pivot Type</Label>
              <Select value={props.pivotType} onValueChange={props.setPivotType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="niche_change">Niche Change</SelectItem>
                  <SelectItem value="industry_change">Industry Change</SelectItem>
                  <SelectItem value="product_change">Product Change</SelectItem>
                  <SelectItem value="business_model_change">Business Model Change</SelectItem>
                  <SelectItem value="target_customer_change">Target Customer Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={props.pivotDate}
                onChange={(e) => props.setPivotDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>From What *</Label>
            <Textarea
              value={props.fromWhat}
              onChange={(e) => props.setFromWhat(e.target.value)}
              placeholder="What were you doing before?"
              rows={2}
            />
          </div>
          <div>
            <Label>To What *</Label>
            <Textarea
              value={props.toWhat}
              onChange={(e) => props.setToWhat(e.target.value)}
              placeholder="What are you pivoting to?"
              rows={2}
            />
          </div>
          <div>
            <Label>Why Pivoting *</Label>
            <Textarea
              value={props.whyPivoting}
              onChange={(e) => props.setWhyPivoting(e.target.value)}
              placeholder="What triggered this pivot?"
              rows={3}
            />
          </div>
          <div>
            <Label>Trigger</Label>
            <Select value={props.trigger} onValueChange={props.setTrigger}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_insight">Customer Insight</SelectItem>
                <SelectItem value="market_research">Market Research</SelectItem>
                <SelectItem value="technology_wave">Technology Wave</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="failed_hypothesis">Failed Hypothesis</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Evidence</Label>
            <Textarea
              value={props.evidence}
              onChange={(e) => props.setEvidence(e.target.value)}
              placeholder="What evidence supports this pivot?"
              rows={2}
            />
          </div>
          <div>
            <Label>Expected Impact</Label>
            <Textarea
              value={props.expectedImpact}
              onChange={(e) => props.setExpectedImpact(e.target.value)}
              placeholder="What do you expect to happen?"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={props.onSubmit}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Pivot
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
