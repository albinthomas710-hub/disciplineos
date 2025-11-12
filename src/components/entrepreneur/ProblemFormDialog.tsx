import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Target, AlertCircle, DollarSign } from "lucide-react";

interface ProblemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  problemTitle: string;
  setProblemTitle: (value: string) => void;
  problemDescription: string;
  setProblemDescription: (value: string) => void;
  problemCategory: string;
  setProblemCategory: (value: any) => void;
  status: string;
  setStatus: (value: any) => void;
  dollarValue: number;
  setDollarValue: (value: number) => void;
  painLevel: number;
  setPainLevel: (value: number) => void;
  discoverySource: string;
  setDiscoverySource: (value: any) => void;
  discoveredDate: string;
  setDiscoveredDate: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  peopleWhoHaveThis: number;
  setPeopleWhoHaveThis: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  // NEW: Pain/Urgency/Cost Framework
  isPainful: boolean;
  setIsPainful: (value: boolean) => void;
  isUrgent: boolean;
  setIsUrgent: (value: boolean) => void;
  isCostly: boolean;
  setIsCostly: (value: boolean) => void;
  is8020Focus: boolean;
  setIs8020Focus: (value: boolean) => void;
  // NEW: Deadline Tracking
  validationDeadline: string;
  setValidationDeadline: (value: string) => void;
  solutionDeadline: string;
  setSolutionDeadline: (value: string) => void;
  deadlineNotes: string;
  setDeadlineNotes: (value: string) => void;
  // NEW: Pain Point Mining
  sourceUrl: string;
  setSourceUrl: (value: string) => void;
  sourceType: string;
  setSourceType: (value: string) => void;
  miningNotes: string;
  setMiningNotes: (value: string) => void;
}

export function ProblemFormDialog(props: ProblemFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Problem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Problem Title *</Label>
            <Input
              value={props.problemTitle}
              onChange={(e) => props.setProblemTitle(e.target.value)}
              placeholder="e.g., Insurance agents waste 10 hours/week on manual data entry"
            />
          </div>

          <div>
            <Label>Problem Description *</Label>
            <Textarea
              value={props.problemDescription}
              onChange={(e) => props.setProblemDescription(e.target.value)}
              placeholder="Detailed description of the problem..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={props.problemCategory} onValueChange={props.setProblemCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="big_10m_plus">Big $10M+</SelectItem>
                  <SelectItem value="roi_focus">ROI Focus</SelectItem>
                  <SelectItem value="small_win">Small Win</SelectItem>
                  <SelectItem value="people_pay_for">People Pay For</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={props.status} onValueChange={props.setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovered">Discovered</SelectItem>
                  <SelectItem value="researching">Researching</SelectItem>
                  <SelectItem value="building_solution">Building Solution</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="shelved">Shelved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dollar Value ($/month)</Label>
              <Input
                type="number"
                min="0"
                value={props.dollarValue || ""}
                onChange={(e) => props.setDollarValue(parseFloat(e.target.value) || 0)}
                placeholder="1000"
              />
            </div>

            <div>
              <Label>Pain Level: {props.painLevel}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={props.painLevel}
                onChange={(e) => props.setPainLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Discovery Source</Label>
            <Select value={props.discoverySource} onValueChange={props.setDiscoverySource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_interview">Customer Interview</SelectItem>
                <SelectItem value="market_research">Market Research</SelectItem>
                <SelectItem value="personal_experience">Personal Experience</SelectItem>
                <SelectItem value="competitor_analysis">Competitor Analysis</SelectItem>
                <SelectItem value="industry_report">Industry Report</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="g2_reviews">G2 Reviews</SelectItem>
                <SelectItem value="facebook_groups">Facebook Groups</SelectItem>
                <SelectItem value="trustpilot">Trustpilot</SelectItem>
                <SelectItem value="forum_mining">Forum Mining</SelectItem>
              </SelectContent>
            </Select>
          </div>

            <div>
              <Label>Discovered Date</Label>
              <Input
                type="date"
                value={props.discoveredDate}
                onChange={(e) => props.setDiscoveredDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name (if applicable)</Label>
              <Input
                value={props.customerName}
                onChange={(e) => props.setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Industry</Label>
              <Input
                value={props.industry}
                onChange={(e) => props.setIndustry(e.target.value)}
                placeholder="e.g., Insurance, Healthcare"
              />
            </div>
          </div>

          <div>
            <Label>People Who Have This Problem</Label>
            <Input
              type="number"
              min="1"
              value={props.peopleWhoHaveThis || ""}
              onChange={(e) => props.setPeopleWhoHaveThis(parseInt(e.target.value) || 1)}
              placeholder="100"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={props.notes}
              onChange={(e) => props.setNotes(e.target.value)}
              placeholder="Additional context, observations, etc..."
              rows={3}
            />
          </div>

          {/* NEW: Pain/Urgency/Cost Framework */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold">Pain/Urgency/Cost Framework</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPainful"
                  checked={props.isPainful}
                  onCheckedChange={props.setIsPainful}
                />
                <label htmlFor="isPainful" className="text-sm font-medium">
                  😫 Painful (Causes significant pain)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isUrgent"
                  checked={props.isUrgent}
                  onCheckedChange={props.setIsUrgent}
                />
                <label htmlFor="isUrgent" className="text-sm font-medium">
                  ⚡ Urgent (Needs immediate attention)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCostly"
                  checked={props.isCostly}
                  onCheckedChange={props.setIsCostly}
                />
                <label htmlFor="isCostly" className="text-sm font-medium">
                  💸 Costly (Significant money/time cost)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is8020Focus"
                  checked={props.is8020Focus}
                  onCheckedChange={props.setIs8020Focus}
                />
                <label htmlFor="is8020Focus" className="text-sm font-medium">
                  🎯 80/20 Focus (High-leverage problem)
                </label>
              </div>
            </div>
          </div>

          {/* NEW: Deadline Tracking */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold">Hard Deadlines (No Lying to Yourself)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Validation Deadline</Label>
                <Input
                  type="date"
                  value={props.validationDeadline}
                  onChange={(e) => props.setValidationDeadline(e.target.value)}
                />
              </div>
              <div>
                <Label>Solution Ship Deadline</Label>
                <Input
                  type="date"
                  value={props.solutionDeadline}
                  onChange={(e) => props.setSolutionDeadline(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3">
              <Label>Deadline Notes</Label>
              <Textarea
                value={props.deadlineNotes}
                onChange={(e) => props.setDeadlineNotes(e.target.value)}
                placeholder="Why these deadlines? What happens if you miss them?"
                rows={2}
              />
            </div>
          </div>

          {/* NEW: Pain Point Mining */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Pain Point Mining (Reddit, G2, Forums)</h4>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Source URL</Label>
                <Input
                  value={props.sourceUrl}
                  onChange={(e) => props.setSourceUrl(e.target.value)}
                  placeholder="https://reddit.com/r/... or G2 review link"
                />
              </div>
              <div>
                <Label>Source Type</Label>
                <Input
                  value={props.sourceType}
                  onChange={(e) => props.setSourceType(e.target.value)}
                  placeholder="e.g., Reddit, G2, Facebook Group, Trustpilot"
                />
              </div>
              <div>
                <Label>Mining Notes</Label>
                <Textarea
                  value={props.miningNotes}
                  onChange={(e) => props.setMiningNotes(e.target.value)}
                  placeholder="What did you find? Key insights from forum/review mining..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={props.onSubmit}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Problem
            </Button>
            <Button
              variant="outline"
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
