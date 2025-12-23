import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TimeBlockEditor from "./TimeBlockEditor";

export default function TimetableManager() {
  const timetables = useQuery((api as any).timetables.list);
  const activeTimetable = useQuery((api as any).timetables.getActive);
  const createTimetable = useMutation((api as any).timetables.create);
  const setActive = useMutation((api as any).timetables.setActive);
  const removeTimetable = useMutation((api as any).timetables.remove);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Id<"timetables"> | null>(null);
  const [newTimetable, setNewTimetable] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });

  const handleCreate = async () => {
    if (!newTimetable.name.trim()) {
      toast.error("Please enter a timetable name");
      return;
    }

    try {
      await createTimetable(newTimetable);
      toast.success("Timetable created!");
      setShowCreateDialog(false);
      setNewTimetable({ name: "", description: "", color: "#6366f1" });
    } catch (error) {
      toast.error("Failed to create timetable");
    }
  };

  const handleSetActive = async (id: Id<"timetables">) => {
    try {
      await setActive({ id });
      toast.success("Timetable activated!");
    } catch (error) {
      toast.error("Failed to activate timetable");
    }
  };

  const handleDelete = async (id: Id<"timetables">) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return;

    try {
      await removeTimetable({ id });
      toast.success("Timetable deleted");
    } catch (error) {
      toast.error("Failed to delete timetable");
    }
  };

  if (!timetables) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Timetables</h2>
          <p className="text-muted-foreground">
            Manage your daily schedules and routines
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          New Timetable
        </Button>
      </div>

      {/* Timetables Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {timetables.map((timetable: any, i: number) => {
          const isActive = activeTimetable?._id === timetable._id;

          return (
            <motion.div
              key={timetable._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "border-2 border-primary shadow-xl scale-[1.02] bg-gradient-to-br from-background to-accent/10"
                    : "hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
                }`}
                onClick={() => !isActive && handleSetActive(timetable._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                          isActive ? "ring-2 ring-offset-2 ring-primary" : ""
                        }`}
                        style={{ backgroundColor: timetable.color + "20" }}
                      >
                        <Calendar className="h-6 w-6" style={{ color: timetable.color }} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          {timetable.name}
                          {isActive && (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-1 pl-1 pr-2">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          )}
                        </CardTitle>
                        {timetable.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {timetable.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTimetable(timetable._id);
                        }}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(timetable._id);
                        }}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      {isActive ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Running Now
                        </span>
                      ) : (
                        "Click to activate"
                      )}
                    </span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-semibold text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTimetable(timetable._id);
                      }}
                    >
                      Edit Schedule →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Timetable</DialogTitle>
            <DialogDescription>
              Set up a new daily schedule for different routines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., School Days, Holiday Routine"
                value={newTimetable.name}
                onChange={(e) =>
                  setNewTimetable({ ...newTimetable, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this timetable..."
                value={newTimetable.description}
                onChange={(e) =>
                  setNewTimetable({
                    ...newTimetable,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} className="cursor-pointer">
              Create Timetable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Block Editor */}
      {editingTimetable && (
        <TimeBlockEditor
          timetableId={editingTimetable}
          onClose={() => setEditingTimetable(null)}
        />
      )}
    </div>
  );
}