import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Trash, Plus, Settings, Edit2, GripVertical } from "lucide-react";
import CategoryManager from "./CategoryManager";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TimeBlockEditorProps {
  timetableId: Id<"timetables">;
  onClose: () => void;
  onSave?: (updatedBlock: any) => void;
}

interface SortableTimeBlockProps {
  block: any;
  onEdit: (block: any) => void;
  onDelete: (blockId: Id<"timeBlocks">) => void;
}

function SortableTimeBlock({ block, onEdit, onDelete }: SortableTimeBlockProps) {
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
      className={`flex items-center gap-3 p-3 border rounded-lg bg-background ${
        isDragging ? "shadow-lg z-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{block.title}</span>
          <span className="text-xs text-muted-foreground">
            {block.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {block.startTime} - {block.endTime}
        </p>
        {block.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {block.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(block);
        }}
        className="cursor-pointer text-blue-600"
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
        className="cursor-pointer text-red-600"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function TimeBlockEditor({
  timetableId,
  onClose,
  onSave,
}: TimeBlockEditorProps) {
  const timetable = useQuery((api as any).timetables.getById, { id: timetableId });
  const timeBlocks = useQuery((api as any).timeBlocks.listByTimetable, { timetableId });
  const createBlock = useMutation((api as any).timeBlocks.create);
  const updateBlock = useMutation((api as any).timeBlocks.update);
  const removeBlock = useMutation((api as any).timeBlocks.remove);
  const categories = useQuery((api as any).categories.list);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<Id<"timeBlocks"> | null>(null);
  const [newBlock, setNewBlock] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "General",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !timeBlocks) return;

    if (active.id !== over.id) {
      const oldIndex = timeBlocks.findIndex((b: any) => b._id === active.id);
      const newIndex = timeBlocks.findIndex((b: any) => b._id === over.id);

      const reorderedBlocks = arrayMove(timeBlocks, oldIndex, newIndex);

      try {
        // Update all affected blocks with new order
        for (let i = 0; i < reorderedBlocks.length; i++) {
          await updateBlock({
            id: (reorderedBlocks[i] as any)._id,
            order: i + 1,
          });
        }
        toast.success("Time blocks reordered!");
      } catch (error) {
        toast.error("Failed to reorder time blocks");
      }
    }
  };

  const handleAddBlock = async () => {
    if (!newBlock.title.trim() || !newBlock.startTime || !newBlock.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingBlockId) {
        await updateBlock({
          id: editingBlockId,
          ...newBlock,
        });
        toast.success("Time block updated!");
      } else {
        await createBlock({
          timetableId,
          ...newBlock,
          order: (timeBlocks?.length || 0) + 1,
        });
        toast.success("Time block added!");
      }
      setShowAddDialog(false);
      setEditingBlockId(null);
      setNewBlock({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "General",
      });
    } catch (error) {
      toast.error(editingBlockId ? "Failed to update time block" : "Failed to add time block");
    }
  };

  const handleEditBlock = (block: any) => {
    setEditingBlockId(block._id);
    setNewBlock({
      title: block.title,
      description: block.description || "",
      startTime: block.startTime,
      endTime: block.endTime,
      category: block.category,
    });
    setShowAddDialog(true);
  };

  const handleDeleteBlock = async (blockId: Id<"timeBlocks">) => {
    if (!confirm("Delete this time block?")) return;

    try {
      await removeBlock({ id: blockId });
      toast.success("Time block deleted");
    } catch (error) {
      toast.error("Failed to delete time block");
    }
  };

  if (!timetable || !timeBlocks || !categories) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Time Blocks - {timetable.name}</DialogTitle>
            <DialogDescription>
              Drag and drop to reorder time blocks
            </DialogDescription>
          </DialogHeader>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={timeBlocks.map((b: any) => b._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {timeBlocks.map((block: any) => (
                  <SortableTimeBlock
                    key={block._id}
                    block={block}
                    onEdit={handleEditBlock}
                    onDelete={handleDeleteBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowCategoryManager(true)}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
            <Button
              onClick={() => {
                setEditingBlockId(null);
                setNewBlock({
                  title: "",
                  description: "",
                  startTime: "",
                  endTime: "",
                  category: "General",
                });
                setShowAddDialog(true);
              }}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingBlockId(null);
          setNewBlock({
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            category: "General",
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlockId ? "Edit Time Block" : "Add Time Block"}</DialogTitle>
            <DialogDescription>
              {editingBlockId ? "Update the time block details" : "Create a new time block for this timetable"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Morning Exercise"
                value={newBlock.title}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will you do during this block?"
                value={newBlock.description}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newBlock.startTime}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newBlock.endTime}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newBlock.category}
                onValueChange={(value) =>
                  setNewBlock({ ...newBlock, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any, index: number) => (
                    <SelectItem key={cat._id || index} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingBlockId(null);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleAddBlock} className="cursor-pointer">
              {editingBlockId ? "Update Block" : "Add Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Manager Dialog */}
      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
    </>
  );
}