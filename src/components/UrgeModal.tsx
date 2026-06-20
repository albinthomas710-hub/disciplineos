import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { AlertTriangle, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UrgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UrgeModal({ open, onOpenChange }: UrgeModalProps) {
  const completeMicroChallenge = useMutation((api as any).dopamineShield.completeMicroChallenge);
  const [summary, setSummary] = useState("");
  const [timeLeft, setTimeLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeLeft(90);
      setIsActive(true);
      setSummary("");
    }
  }, [open]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleSubmit = async () => {
    const wordCount = summary.trim().split(/\s+/).length;

    if (wordCount < 50) {
      toast.error(`Need at least 50 words. Current: ${wordCount}`);
      return;
    }

    if (timeLeft <= 0) {
      toast.error("Time's up! Challenge failed.");
      await completeMicroChallenge({ success: false, summary });
      onOpenChange(false);
      return;
    }

    try {
      await completeMicroChallenge({ success: true, summary });
      toast.success("Challenge completed! 3-minute access granted 🎉");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to complete challenge");
    }
  };

  const wordCount = summary.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            Shorts cost hours. Complete this challenge first.
          </DialogTitle>
          <DialogDescription>
            Write a 50-word summary of what you just learned in 90 seconds to earn a 3-minute break.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border-2 border-orange-200 dark:border-orange-800">
            <Timer className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              {timeLeft}s remaining
            </span>
          </div>

          {/* Summary Input */}
          <div>
            <Label htmlFor="summary">
              Summary ({wordCount} / 50 words minimum)
            </Label>
            <Textarea
              id="summary"
              placeholder="What did you just learn? Summarize the key points..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
              className="mt-2"
            />
          </div>

          {/* AI Guilt Anchor */}
          <div className="p-3 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              ⚠️ This will cost minutes of your day. Are you building or consuming?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={wordCount < 50 || timeLeft <= 0}
              className="flex-1 cursor-pointer"
            >
              Submit Challenge
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
