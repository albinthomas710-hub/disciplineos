import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Brain, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

interface TemptationInterceptorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemptationInterceptorModal({
  open,
  onOpenChange,
}: TemptationInterceptorModalProps) {
  const completeLearning = useMutation((api as any).dopamineShield.completeLearningSession);
  const startMicroTask = useMutation((api as any).dopamineShield.startMicroTask);

  const handleContinueLearning = async () => {
    try {
      await startMicroTask({ taskType: "learning" });
      toast.success("Great choice! Continue your learning momentum 🎯");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to start micro-task");
    }
  };

  const handleQuickRecovery = async () => {
    try {
      await startMicroTask({ taskType: "recovery" });
      toast.success("Take 3 minutes to breathe and reset 🧘");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to start recovery");
    }
  };

  const handleAllowShorts = async () => {
    try {
      await completeLearning();
      toast.warning("Complete a 10-minute task or create a plan to unlock shorts");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-purple-600" />
            You just learned — protect your momentum
          </DialogTitle>
          <DialogDescription className="text-base">
            Finish = Win. Short temptations start now. Choose your next action wisely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Option 1: Continue Learning */}
          <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Continue Learning (Recommended)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Keep your momentum going with a related 5-15 minute learning micro-task
                </p>
                <Button
                  onClick={handleContinueLearning}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  Start Micro-Task
                </Button>
              </div>
            </div>
          </div>

          {/* Option 2: Quick Recovery */}
          <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Quick Recovery</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  3-minute breathing exercise + mini-reflection to reset your mind
                </p>
                <Button
                  onClick={handleQuickRecovery}
                  variant="outline"
                  className="cursor-pointer"
                >
                  Start Recovery
                </Button>
              </div>
            </div>
          </div>

          {/* Option 3: Allow Shorts (Friction Path) */}
          <div className="p-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Allow Shorts Now</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete a 10-minute task or type a 3-line plan for the next 60 minutes
                </p>
                <Button
                  onClick={handleAllowShorts}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  Request Access (Friction Path)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
