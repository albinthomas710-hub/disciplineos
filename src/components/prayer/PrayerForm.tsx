import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface PrayerFormProps {
  title: string;
  content: string;
  category?: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const categories = [
  { value: "gratitude", label: "Gratitude", color: "from-green-500 to-emerald-500" },
  { value: "guidance", label: "Guidance", color: "from-blue-500 to-cyan-500" },
  { value: "intercession", label: "Intercession", color: "from-purple-500 to-pink-500" },
  { value: "confession", label: "Confession", color: "from-orange-500 to-red-500" },
  { value: "praise", label: "Praise", color: "from-yellow-500 to-amber-500" },
  { value: "petition", label: "Petition", color: "from-indigo-500 to-purple-500" },
];

export function PrayerForm({
  title,
  content,
  category,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onSubmit,
  onCancel,
}: PrayerFormProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <Card className="border-2 border-purple-300 dark:border-purple-700">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Prayer Title</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="What are you praying for?"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Category (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? "default" : "outline"}
                  onClick={() => onCategoryChange(category === cat.value ? "" : cat.value)}
                  className="cursor-pointer"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Prayer</Label>
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write your prayer..."
              className="mt-2 min-h-[150px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} className="cursor-pointer flex-1">
              <Check className="h-4 w-4 mr-2" />
              Save Prayer
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