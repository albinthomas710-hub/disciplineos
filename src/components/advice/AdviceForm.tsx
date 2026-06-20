import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface AdviceFormProps {
  title: string;
  content: string;
  source: string;
  tags: string;
  isEditing: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AdviceForm({
  title,
  content,
  source,
  tags,
  isEditing,
  onTitleChange,
  onContentChange,
  onSourceChange,
  onTagsChange,
  onSubmit,
  onCancel,
}: AdviceFormProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <Card className="border-2 border-emerald-300 dark:border-emerald-700">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Brief title for this advice"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Advice Content</Label>
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write the advice here..."
              className="mt-2 min-h-[150px]"
            />
          </div>
          <div>
            <Label>Source (optional)</Label>
            <Input
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              placeholder="Who gave this advice? Book, person, etc."
              className="mt-2"
            />
          </div>
          <div>
            <Label>Tags (optional, comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => onTagsChange(e.target.value)}
              placeholder="success, mindset, habits..."
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} className="cursor-pointer flex-1">
              <Check className="h-4 w-4 mr-2" />
              {isEditing ? "Update Advice" : "Add Advice"}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
