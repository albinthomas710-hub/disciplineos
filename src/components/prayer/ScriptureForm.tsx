import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface ScriptureFormProps {
  reference: string;
  text: string;
  translation: string;
  category: string;
  notes: string;
  onReferenceChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onTranslationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ScriptureForm({
  reference,
  text,
  translation,
  category,
  notes,
  onReferenceChange,
  onTextChange,
  onTranslationChange,
  onCategoryChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: ScriptureFormProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <Card className="border-2 border-blue-300 dark:border-blue-700">
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Reference (e.g., John 3:16)</Label>
              <Input
                value={reference}
                onChange={(e) => onReferenceChange(e.target.value)}
                placeholder="John 3:16"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Translation (optional)</Label>
              <Input
                value={translation}
                onChange={(e) => onTranslationChange(e.target.value)}
                placeholder="NIV, KJV, ESV..."
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label>Scripture Text</Label>
            <Textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter the scripture text..."
              className="mt-2 min-h-[100px]"
            />
          </div>
          <div>
            <Label>Category (optional)</Label>
            <Input
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="faith, hope, love, strength..."
              className="mt-2"
            />
          </div>
          <div>
            <Label>Personal Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="What does this mean to you?"
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} className="cursor-pointer flex-1">
              <Check className="h-4 w-4 mr-2" />
              Save Scripture
            </Button>
            <Button variant="outline" onClick={onCancel} className="cursor-pointer">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
