import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Sparkles, Skull, Target, AlertTriangle } from "lucide-react";

interface AddResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddResolutionDialog({ open, onOpenChange }: AddResolutionDialogProps) {
  const createResolution = useMutation(api.resolutions.create);
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"build" | "break">("build");
  const [why, setWhy] = useState("");
  const [consequences, setConsequences] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Give your resolution a name.");
      return;
    }
    if (!why.trim()) {
      toast.error("You must define your 'Why'. It is your fuel.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createResolution({
        title,
        type,
        why,
        consequences,
      });
      toast.success("Resolution Set. Make it count.");
      onOpenChange(false);
      // Reset form
      setTitle("");
      setWhy("");
      setConsequences("");
      setType("build");
    } catch (e) {
      toast.error("Failed to create resolution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-b from-background to-background/95 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {type === "build" ? (
              <Sparkles className="h-6 w-6 text-blue-500" />
            ) : (
              <Skull className="h-6 w-6 text-red-500" />
            )}
            {type === "build" ? "Forge a New Habit" : "Destroy a Vice"}
          </DialogTitle>
          <DialogDescription>
            Define your commitment. Be specific. Be ruthless.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>What is your objective?</Label>
            <RadioGroup 
              defaultValue="build" 
              value={type} 
              onValueChange={(v) => setType(v as "build" | "break")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="build" id="build" className="peer sr-only" />
                <Label
                  htmlFor="build"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                >
                  <Target className="mb-2 h-6 w-6 text-blue-500" />
                  <span className="font-semibold">Build Good Habit</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">No Excuses</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="break" id="break" className="peer sr-only" />
                <Label
                  htmlFor="break"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-500/10 cursor-pointer transition-all"
                >
                  <AlertTriangle className="mb-2 h-6 w-6 text-red-500" />
                  <span className="font-semibold">Break Bad Habit</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">Avoid List</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Resolution Title</Label>
            <Input 
              id="title" 
              placeholder={type === "build" ? "e.g., Daily Deep Work" : "e.g., No Social Media"} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="why" className="text-primary font-semibold flex items-center gap-2">
              The "Why" (Psychological Anchor)
            </Label>
            <Textarea 
              id="why" 
              placeholder="Why MUST you do this? What is the deep pain or desire driving this? Dig deep." 
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              className="min-h-[80px] border-primary/30 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consequences" className="text-destructive font-semibold flex items-center gap-2">
              The Cost of Failure (Negative Visualization)
            </Label>
            <Textarea 
              id="consequences" 
              placeholder="What happens if you fail? Who do you become? What do you lose?" 
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              className="min-h-[80px] border-destructive/30 focus:border-destructive"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={type === "build" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isSubmitting ? "Committing..." : "Lock In Resolution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
