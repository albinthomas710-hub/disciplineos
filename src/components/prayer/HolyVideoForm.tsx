import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface HolyVideoFormProps {
  title: string;
  url: string;
  description: string;
  category: string;
  speaker: string;
  notes: string;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSpeakerChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function HolyVideoForm({
  title,
  url,
  description,
  category,
  speaker,
  notes,
  onTitleChange,
  onUrlChange,
  onDescriptionChange,
  onCategoryChange,
  onSpeakerChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: HolyVideoFormProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <Card className="border-2 border-red-300 dark:border-red-700">
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Category (optional)</Label>
              <Input
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                placeholder="sermon, worship, teaching..."
                className="mt-2"
              />
            </div>
            <div>
              <Label>Speaker (optional)</Label>
              <Input
                value={speaker}
                onChange={(e) => onSpeakerChange(e.target.value)}
                placeholder="Pastor/speaker name"
                className="mt-2"
              />
            </div>
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
              Save Video
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
