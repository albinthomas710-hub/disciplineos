import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Phone, Building2, Linkedin, Twitter, Globe } from "lucide-react";

export function FeedbackForm({ onSuccess }: { onSuccess?: () => void }) {
  const createFeedback = useMutation((api as any).entrepreneurOS.createFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    companyName: "",
    linkedin: "",
    twitter: "",
    website: "",
    feedbackType: "general" as const,
    feedbackText: "",
    satisfactionScore: 5,
    priority: "medium" as const,
    painHours: 0,
    revenueImpactType: "no_impact" as const,
    revenueAmount: 0,
    urgencyLevel: "nice_to_have" as const,
    willTestFix: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createFeedback({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || undefined,
        clientPhone: formData.clientPhone || undefined,
        companyName: formData.companyName || undefined,
        socialLinks: {
          linkedin: formData.linkedin || undefined,
          twitter: formData.twitter || undefined,
          website: formData.website || undefined,
        },
        feedbackType: formData.feedbackType,
        feedbackText: formData.feedbackText,
        satisfactionScore: formData.satisfactionScore,
        priority: formData.priority,
        painHours: formData.painHours || undefined,
        revenueImpactType: formData.revenueImpactType,
        revenueAmount: formData.revenueAmount || undefined,
        urgencyLevel: formData.urgencyLevel,
        willTestFix: formData.willTestFix,
      });

      toast.success("Feedback added successfully!");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        companyName: "",
        linkedin: "",
        twitter: "",
        website: "",
        feedbackType: "general",
        feedbackText: "",
        satisfactionScore: 5,
        priority: "medium",
        painHours: 0,
        revenueImpactType: "no_impact",
        revenueAmount: 0,
        urgencyLevel: "nice_to_have",
        willTestFix: false,
      });
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add feedback");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
              className="focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="pl-10 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="pl-10 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Social Links</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
              <Input
                placeholder="LinkedIn URL"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="pl-10 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="relative">
              <Twitter className="absolute left-3 top-3 h-4 w-4 text-sky-500" />
              <Input
                placeholder="Twitter/X URL"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="pl-10 focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-green-600" />
              <Input
                placeholder="Website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="pl-10 focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="feedbackType">Feedback Type *</Label>
            <Select
              value={formData.feedbackType}
              onValueChange={(value: any) => setFormData({ ...formData, feedbackType: value })}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="testimonial">Testimonial</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-red-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedbackText">Feedback *</Label>
          <Textarea
            id="feedbackText"
            value={formData.feedbackText}
            onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}
            required
            rows={4}
            className="focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="satisfactionScore">Satisfaction Score (1-10) *</Label>
            <Input
              id="satisfactionScore"
              type="number"
              min="1"
              max="10"
              value={formData.satisfactionScore}
              onChange={(e) => setFormData({ ...formData, satisfactionScore: parseInt(e.target.value) })}
              required
              className="focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="painHours">Pain Level (Hours Wasted/Week)</Label>
            <Input
              id="painHours"
              type="number"
              min="0"
              value={formData.painHours}
              onChange={(e) => setFormData({ ...formData, painHours: parseFloat(e.target.value) })}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="revenueImpactType">Revenue Impact</Label>
            <Select
              value={formData.revenueImpactType}
              onValueChange={(value: any) => setFormData({ ...formData, revenueImpactType: value })}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-green-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_impact">No Impact</SelectItem>
                <SelectItem value="missing_opportunity">Missing Opportunity</SelectItem>
                <SelectItem value="losing_revenue">Losing Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenueAmount">Revenue Amount ($)</Label>
            <Input
              id="revenueAmount"
              type="number"
              min="0"
              value={formData.revenueAmount}
              onChange={(e) => setFormData({ ...formData, revenueAmount: parseFloat(e.target.value) })}
              className="focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Urgency Level</Label>
            <Select
              value={formData.urgencyLevel}
              onValueChange={(value: any) => setFormData({ ...formData, urgencyLevel: value })}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-red-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                <SelectItem value="major_friction">Major Friction</SelectItem>
                <SelectItem value="blocking">Blocking</SelectItem>
                <SelectItem value="critical_for_renewal">Critical for Renewal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.willTestFix}
                onChange={(e) => setFormData({ ...formData, willTestFix: e.target.checked })}
                className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm">Customer will test fix</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Feedback...
            </>
          ) : (
            "Add Feedback"
          )}
        </Button>
      </form>
    </Card>
  );
}
