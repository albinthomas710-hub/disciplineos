import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryFormProps {
  categoryName: string;
  categoryDescription: string;
  categoryColor: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const colorOptions = [
  { value: "from-green-500 to-emerald-500", label: "Green" },
  { value: "from-blue-500 to-cyan-500", label: "Blue" },
  { value: "from-purple-500 to-pink-500", label: "Purple" },
  { value: "from-orange-500 to-red-500", label: "Orange" },
  { value: "from-yellow-500 to-amber-500", label: "Yellow" },
  { value: "from-indigo-500 to-purple-500", label: "Indigo" },
];

export function CategoryForm({
  categoryName,
  categoryDescription,
  categoryColor,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <Card className="border-2 border-green-300 dark:border-green-700">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Category Name</Label>
            <Input
              value={categoryName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Life Lessons, Career, Relationships..."
              className="mt-2"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={categoryDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="What kind of advice goes here?"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {colorOptions.map((color) => (
                <Button
                  key={color.value}
                  variant={categoryColor === color.value ? "default" : "outline"}
                  onClick={() => onColorChange(color.value)}
                  className="cursor-pointer"
                >
                  {color.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} className="cursor-pointer flex-1">
              <Check className="h-4 w-4 mr-2" />
              Create Category
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
