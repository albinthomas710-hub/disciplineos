import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface VideoFormProps {
  title: string;
  url: string;
  description: string;
  notes: string;
  isEditing: boolean;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function VideoForm({
  title,
  url,
  description,
  notes,
  isEditing,
  onTitleChange,
  onUrlChange,
  onDescriptionChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: VideoFormProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <Card className="border-2 border-cyan-300 dark:border-cyan-700">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Video Title</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter video title"
              className="mt-2"
            />
          </div>
          <div>
            <Label>YouTube URL</Label>
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-2"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description..."
              className="mt-2"
            />
          </div>
          <div>
            <Label>Personal Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Your thoughts on this video..."
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} className="cursor-pointer flex-1">
              <Check className="h-4 w-4 mr-2" />
              {isEditing ? "Update Video" : "Add Video"}
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
