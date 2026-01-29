import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface AddSinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultConquered?: boolean;
}

export function AddSinDialog({ open, onOpenChange, defaultConquered = false }: AddSinDialogProps) {
  const createSin = useMutation(api.sins.create);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [antidote, setAntidote] = useState("");
  const [isConquered, setIsConquered] = useState(defaultConquered);

  useEffect(() => {
    if (open) {
      setIsConquered(defaultConquered);
    }
  }, [open, defaultConquered]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createSin({
        title,
        category,
        scriptureAntidote: antidote,
        status: isConquered ? "conquered" : "active",
      });
      setTitle("");
      setCategory("");
      setAntidote("");
      setIsConquered(false);
      onOpenChange(false);
      toast.success(isConquered ? "Added to conquered list" : "Added to spiritual warfare list");
    } catch (e) {
      toast.error("Failed to add item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isConquered ? "Record a Past Victory" : "Identify a Struggle"}</DialogTitle>
          <DialogDescription>
            {isConquered 
              ? "Record a sin you have overcome to remember God's faithfulness."
              : "\"For we do not wrestle against flesh and blood...\" - Eph 6:12"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name of Sin/Struggle</label>
            <Input 
              placeholder="e.g., Pride, Anger, Lust, Sloth" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category (Optional)</label>
            <Input 
              placeholder="e.g., Thought, Word, Deed" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Scripture Antidote</label>
            <Textarea 
              placeholder="A verse to fight this specific struggle..." 
              value={antidote}
              onChange={(e) => setAntidote(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="conquered-check" 
              checked={isConquered}
              onCheckedChange={(checked) => setIsConquered(checked as boolean)}
            />
            <label
              htmlFor="conquered-check"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Already Conquered (Archive immediately)
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate}>Add to List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
