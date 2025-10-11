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
import { Loader2, Trash, Plus } from "lucide-react";

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
  const timetable = useQuery(api.timetables.getById, { id: timetableId });
  const timeBlocks = useQuery(api.timeBlocks.listByTimetable, { timetableId });
  const createBlock = useMutation(api.timeBlocks.create);
  const removeBlock = useMutation(api.timeBlocks.remove);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBlock, setNewBlock] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "General",
  });

  const handleAddBlock = async () => {
    if (!newBlock.title.trim() || !newBlock.startTime || !newBlock.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createBlock({
        timetableId,
        ...newBlock,
        order: (timeBlocks?.length || 0) + 1,
      });
      toast.success("Time block added!");
      setShowAddDialog(false);
      setNewBlock({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "General",
      });
    } catch (error) {
      toast.error("Failed to add time block");
    }
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

  if (!timetable || !timeBlocks) {
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
              Manage the time blocks for this timetable
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {timeBlocks.map((block) => (
              <div
                key={block._id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
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
                  onClick={() => handleDeleteBlock(block._id)}
                  className="cursor-pointer text-red-600"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
            <DialogDescription>
              Create a new time block for this timetable
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
                  <SelectItem value="Focus">Focus</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Spiritual">Spiritual</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleAddBlock} className="cursor-pointer">
              Add Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}