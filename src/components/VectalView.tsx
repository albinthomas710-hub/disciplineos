import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VectalView() {
  const vectalData = useQuery(api.vectal.getTodayTasks);
  const initializeTasks = useMutation(api.vectal.initializeTodayTasks);
  const toggleTask = useMutation(api.vectal.toggleTask);
  const addTask = useMutation(api.vectal.addTask);
  const deleteTask = useMutation(api.vectal.deleteTask);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
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
      await addTask({ title: newTaskTitle });
      setNewTaskTitle("");
      setIsAdding(false);
      toast.success("Task added!");
    } catch (error) {
      toast.error("Failed to add task");
    }
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
              className="flex gap-2"
            >
              <Input
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
              <Button onClick={handleAddTask} className="cursor-pointer">Add</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle("");
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Tasks */}
          {vectalData.tasks.map((task: any, index: number) => (
            <motion.div
              key={task.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                task.completed
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800"
              }`}
            >
              <div
                onClick={() => handleToggleTask(task.id)}
                className="flex items-center gap-3 flex-1"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400 shrink-0" />
                )}
                <span
                  className={`font-medium ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </span>
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