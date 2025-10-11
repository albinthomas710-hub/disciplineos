import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Target, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VectalView() {
  const vectalData = useQuery(api.vectal.getTodayTasks);
  const initializeTasks = useMutation(api.vectal.initializeTodayTasks);
  const toggleTask = useMutation(api.vectal.toggleTask);
  const addTask = useMutation(api.vectal.addTask);
  const deleteTask = useMutation(api.vectal.deleteTask);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskImportance, setNewTaskImportance] = useState(50);
  const [newTaskIsRecurring, setNewTaskIsRecurring] = useState(true);
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Initialize tasks if they don't exist
  useEffect(() => {
    if (vectalData === null) {
      initializeTasks();
    }
  }, [vectalData, initializeTasks]);

  const handleToggleTask = async (taskId: string) => {
    try {
      const result = await toggleTask({ taskId });
      if (result.allCompleted) {
        toast.success("🎉 All Vectal tasks completed! Amazing work!");
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    try {
      await addTask({ 
        title: newTaskTitle,
        importance: newTaskImportance,
        isRecurring: newTaskIsRecurring,
        dueDate: newTaskIsRecurring ? undefined : newTaskDueDate || undefined,
      });
      setNewTaskTitle("");
      setNewTaskImportance(50);
      setNewTaskIsRecurring(true);
      setNewTaskDueDate("");
      setIsAdding(false);
      toast.success("Task added!");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const getPriorityColor = (importance: number) => {
    if (importance >= 80) return "red"; // P1 - High
    if (importance >= 50) return "yellow"; // P2 - Medium
    return "green"; // P3 - Low
  };

  const getPriorityLabel = (importance: number) => {
    if (importance >= 80) return "P1";
    if (importance >= 50) return "P2";
    return "P3";
  };

  const getPriorityBgClass = (importance: number, completed: boolean) => {
    if (completed) return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (importance >= 80) return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    if (importance >= 50) return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
  };

  const getPriorityIconColor = (importance: number) => {
    if (importance >= 80) return "text-red-600 dark:text-red-400";
    if (importance >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ taskId });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  if (!vectalData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedCount = vectalData.tasks.filter((task: any) => task.completed).length;
  const totalCount = vectalData.tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vectal Daily Tasks</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Complete all tasks to maintain your discipline streak
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {completedCount} of {totalCount} tasks completed
                  </span>
                  <span className="text-sm font-semibold">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>

              {vectalData.allCompleted && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center"
                >
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold text-lg">All Tasks Completed! 🎉</p>
                  <p className="text-sm opacity-90">You're crushing it today!</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Tasks</CardTitle>
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Task Input */}
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-4 p-4 border-2 border-cyan-200 dark:border-cyan-800 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/50"
            >
              <div>
                <Label>Task Title</Label>
                <Input
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Importance: {newTaskImportance} ({getPriorityLabel(newTaskImportance)})</Label>
                <Slider
                  value={[newTaskImportance]}
                  onValueChange={(value) => setNewTaskImportance(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low (P3)</span>
                  <span>Medium (P2)</span>
                  <span>High (P1)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newTaskIsRecurring}
                    onCheckedChange={setNewTaskIsRecurring}
                  />
                  <Label className="flex items-center gap-2">
                    {newTaskIsRecurring ? (
                      <>
                        <Repeat className="h-4 w-4" />
                        Recurring (Every day)
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="h-4 w-4" />
                        Date-specific
                      </>
                    )}
                  </Label>
                </div>
              </div>

              {!newTaskIsRecurring && (
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddTask} className="cursor-pointer flex-1">Add Task</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle("");
                    setNewTaskImportance(50);
                    setNewTaskIsRecurring(true);
                    setNewTaskDueDate("");
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Tasks */}
          {vectalData.tasks.map((task: any, index: number) => (
            <motion.div
              key={task.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${getPriorityBgClass(task.importance, task.completed)}`}
            >
              <div
                onClick={() => handleToggleTask(task.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                  <Circle className={`h-6 w-6 shrink-0 ${getPriorityIconColor(task.importance)}`} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      task.importance >= 80 ? "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200" :
                      task.importance >= 50 ? "bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" :
                      "bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200"
                    }`}>
                      {getPriorityLabel(task.importance)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {task.isRecurring ? (
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        Every day
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {task.dueDate || "No due date"}
                      </span>
                    )}
                    <span>•</span>
                    <span>Importance: {task.importance}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteTask(task.id)}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}

          {vectalData.tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks yet. Add your first task to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}