import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReflectionDialog({
  open,
  onOpenChange,
}: ReflectionDialogProps) {
  const todayReflection = useQuery((api as any).reflections.getToday);
  const saveReflection = useMutation((api as any).reflections.save);

  const [reflection, setReflection] = useState({
    didWell: "",
    brokeDispline: "",
    improvement: "",
  });

  useEffect(() => {
    if (todayReflection) {
      setReflection({
        didWell: todayReflection.didWell || "",
        brokeDispline: todayReflection.brokeDispline || "",
        improvement: Array.isArray(todayReflection.improvements) 
          ? todayReflection.improvements[0] || "" 
          : (todayReflection.improvements || ""),
      });
    }
  }, [todayReflection]);

  const handleSave = async () => {
    if (
      !(reflection.didWell || "").trim() ||
      !(reflection.brokeDispline || "").trim() ||
      !(reflection.improvement || "").trim()
    ) {
      toast.error("Please fill in all reflection fields");
      return;
    }

    try {
      await saveReflection(reflection);
      toast.success("Reflection saved! 🌟");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save reflection");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Daily Reflection</DialogTitle>
          <DialogDescription>
            Take a moment to reflect on your day and plan for tomorrow
          </DialogDescription>
        </DialogHeader>

        {todayReflection === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="didWell">What did I do well today?</Label>
              <div className="mt-2 mb-2 text-sm text-muted-foreground">
                <p className="font-medium text-primary/80">Write 3 wins from today:</p>
                <div className="pl-1 mt-1 space-y-0.5 text-xs opacity-70 font-mono">
                  <p>1. ____________________________________</p>
                  <p>2. ____________________________________</p>
                  <p>3. ____________________________________</p>
                </div>
              </div>
              <Textarea
                id="didWell"
                placeholder="Celebrate your wins, big or small..."
                value={reflection.didWell}
                onChange={(e) =>
                  setReflection({ ...reflection, didWell: e.target.value })
                }
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="brokeDispline">
                Where did I break discipline?
              </Label>
              <Textarea
                id="brokeDispline"
                placeholder="Be honest about where you slipped..."
                value={reflection.brokeDispline}
                onChange={(e) =>
                  setReflection({
                    ...reflection,
                    brokeDispline: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="improvement">How will I improve tomorrow?</Label>
              <Textarea
                id="improvement"
                placeholder="Set your intention for tomorrow..."
                value={reflection.improvement}
                onChange={(e) =>
                  setReflection({ ...reflection, improvement: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="cursor-pointer">
            Save Reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}