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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Trash, Plus, Settings, Edit2, GripVertical, Zap, Brain, MapPin } from "lucide-react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTimeBlock } from "./SortableTimeBlock";

interface TimeBlockEditorProps {
  timetableId: Id<"timetables">;
  onClose: () => void;
  onSave?: (updatedBlock: any) => void;
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
    energyLevel: "medium" as "high" | "medium" | "low",
    isDeepWork: false,
    context: "",
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
        toast.success("Schedule reordered");
      } catch (error) {
        toast.error("Failed to reorder");
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
        toast.success("Block updated");
      } else {
        await createBlock({
          timetableId,
          ...newBlock,
          order: (timeBlocks?.length || 0) + 1,
        });
        toast.success("Block added");
      }
      setShowAddDialog(false);
      setEditingBlockId(null);
      setNewBlock({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "General",
        energyLevel: "medium",
        isDeepWork: false,
        context: "",
      });
    } catch (error) {
      toast.error(editingBlockId ? "Failed to update" : "Failed to add");
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
      energyLevel: block.energyLevel || "medium",
      isDeepWork: block.isDeepWork || false,
      context: block.context || "",
    });
    setShowAddDialog(true);
  };

  const handleDeleteBlock = async (blockId: Id<"timeBlocks">) => {
    if (!confirm("Delete this time block?")) return;

    try {
      await removeBlock({ id: blockId });
      toast.success("Block deleted");
    } catch (error) {
      toast.error("Failed to delete");
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
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-xl">
          <div className="p-6 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="w-1 h-8 bg-primary rounded-full" />
                {timetable.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                Design your perfect day. Drag to reorder.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
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
                  {timeBlocks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">No blocks yet</h3>
                      <p className="text-muted-foreground mb-4">Start building your routine</p>
                      <Button onClick={() => setShowAddDialog(true)}>
                        Add First Block
                      </Button>
                    </div>
                  ) : (
                    timeBlocks.map((block: any) => (
                      <SortableTimeBlock
                        key={block._id}
                        block={block}
                        onEdit={handleEditBlock}
                        onDelete={handleDeleteBlock}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="p-6 border-t sticky bottom-0 bg-background/95 backdrop-blur z-10 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowCategoryManager(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Categories
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
                  energyLevel: "medium",
                  isDeepWork: false,
                  context: "",
                });
                setShowAddDialog(true);
              }}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Add Time Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingBlockId(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBlockId ? "Edit Block" : "New Block"}</DialogTitle>
            <DialogDescription>
              Configure the details for this time slot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Main Info */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Deep Work: Coding"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  className="font-medium"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* CEO / Productivity Features */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" /> Productivity Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Energy Required</Label>
                  <Select
                    value={newBlock.energyLevel}
                    onValueChange={(value: "high" | "medium" | "low") =>
                      setNewBlock({ ...newBlock, energyLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">⚡ High Energy</SelectItem>
                      <SelectItem value="medium">🔋 Medium Energy</SelectItem>
                      <SelectItem value="low">☕ Low Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Category</Label>
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

              <div className="grid gap-2">
                <Label htmlFor="context">Context / Location</Label>
                <Input
                  id="context"
                  placeholder="e.g., Home Office, Gym, Commute"
                  value={newBlock.context}
                  onChange={(e) => setNewBlock({ ...newBlock, context: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Deep Work Session</Label>
                  <p className="text-xs text-muted-foreground">
                    High-focus, distraction-free block
                  </p>
                </div>
                <Switch
                  checked={newBlock.isDeepWork}
                  onCheckedChange={(checked) =>
                    setNewBlock({ ...newBlock, isDeepWork: checked })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Notes / Description</Label>
              <Textarea
                id="description"
                placeholder="Specific goals or details for this block..."
                value={newBlock.description}
                onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
                className="h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingBlockId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBlock}>
              {editingBlockId ? "Save Changes" : "Add Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
    </>
  );
}