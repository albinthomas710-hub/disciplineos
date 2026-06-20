import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, X, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface DayTagsManagerProps {
  selectedDate: Date;
  selectedDateStr: string;
  assignedTagIds?: Id<"calendarTags">[];
}

const COLORS = [
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Amber", value: "bg-amber-500" },
  { name: "Yellow", value: "bg-yellow-500" },
  { name: "Lime", value: "bg-lime-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Emerald", value: "bg-emerald-500" },
  { name: "Teal", value: "bg-teal-500" },
  { name: "Cyan", value: "bg-cyan-500" },
  { name: "Sky", value: "bg-sky-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Indigo", value: "bg-indigo-500" },
  { name: "Violet", value: "bg-violet-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Fuchsia", value: "bg-fuchsia-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Rose", value: "bg-rose-500" },
];

export default function DayTagsManager({ selectedDate, selectedDateStr, assignedTagIds = [] }: DayTagsManagerProps) {
  const tags = useQuery(api.history.getCalendarTags);
  const createTag = useMutation(api.history.createCalendarTag);
  const deleteTag = useMutation(api.history.deleteCalendarTag);
  const toggleDayTag = useMutation(api.history.toggleDayTag);

  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLORS[0].value);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagLabel.trim()) return;
    try {
      await createTag({ label: newTagLabel, color: newTagColor });
      setNewTagLabel("");
      setIsCreating(false);
      toast.success("Tag created");
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  const handleDeleteTag = async (tagId: Id<"calendarTags">) => {
    try {
      await deleteTag({ tagId });
      toast.success("Tag deleted");
    } catch (error) {
      toast.error("Failed to delete tag");
    }
  };

  const handleToggleTag = async (tagId: Id<"calendarTags">) => {
    try {
      await toggleDayTag({ date: selectedDateStr, tagId });
    } catch (error) {
      toast.error("Failed to update tag");
    }
  };

  return (
    <Card className="border-2 border-muted/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Day Tags
        </CardTitle>
        <Popover open={isCreating} onOpenChange={setIsCreating}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Create New Tag</h4>
              <Input 
                placeholder="Tag Name (e.g. Sales, Rest)" 
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`w-6 h-6 rounded-full ${c.value} ${newTagColor === c.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    onClick={() => setNewTagColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
              <Button size="sm" className="w-full" onClick={handleCreateTag}>Create</Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Assigned Tags for Selected Day */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Assigned to {selectedDateStr}
            </label>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {assignedTagIds.length === 0 ? (
                <span className="text-sm text-muted-foreground italic">No tags assigned</span>
              ) : (
                tags?.filter(t => assignedTagIds.includes(t._id)).map(tag => (
                  <Badge 
                    key={tag._id} 
                    className={`${tag.color} text-white hover:${tag.color} cursor-pointer flex items-center gap-1`}
                    onClick={() => handleToggleTag(tag._id)}
                  >
                    {tag.label}
                    <X className="h-3 w-3 ml-1 opacity-70" />
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Available Tags */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Available Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags?.map(tag => {
                const isAssigned = assignedTagIds.includes(tag._id);
                if (isAssigned) return null; // Already shown above
                return (
                  <div key={tag._id} className="group relative">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-secondary flex items-center gap-2"
                      onClick={() => handleToggleTag(tag._id)}
                    >
                      <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                      {tag.label}
                    </Badge>
                    <button 
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag._id);
                      }}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                );
              })}
              {tags?.length === 0 && (
                <span className="text-sm text-muted-foreground italic">Create a tag to get started</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
