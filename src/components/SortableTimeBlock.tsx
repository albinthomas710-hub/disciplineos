import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Brain, Zap, MapPin, Edit2, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

interface SortableTimeBlockProps {
  block: any;
  onEdit: (block: any) => void;
  onDelete: (blockId: Id<"timeBlocks">) => void;
}

export function SortableTimeBlock({ block, onEdit, onDelete }: SortableTimeBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit(block)}
      className={`flex items-center gap-3 p-4 border rounded-xl bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
        isDragging ? "shadow-xl z-50 ring-2 ring-primary" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded-md"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-base truncate">{block.title}</span>
          {block.isDeepWork && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] px-1.5 py-0 h-5">
              <Brain className="h-3 w-3 mr-1" /> Deep Work
            </Badge>
          )}
          {block.energyLevel === "high" && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] px-1.5 py-0 h-5">
              <Zap className="h-3 w-3 mr-1" /> High Energy
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
            {block.startTime} - {block.endTime}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-primary/50" />
            {block.category}
          </span>
          {block.context && (
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {block.context}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(block);
          }}
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block._id);
          }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
