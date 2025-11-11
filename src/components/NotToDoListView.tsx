import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Ban, CheckCircle2, Circle, Loader2, Plus, Trash2, XCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NotToDoListView() {
  const notToDoData = useQuery((api as any).notToDoList.getTodayItems);
  const weeklyStats = useQuery((api as any).notToDoList.getWeeklyStats);
  const initializeItems = useMutation((api as any).notToDoList.initializeTodayItems);
  const markAvoided = useMutation((api as any).notToDoList.markAvoided);
  const addItem = useMutation((api as any).notToDoList.addItem);
  const deleteItem = useMutation((api as any).notToDoList.deleteItem);
  
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("distraction");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemImportance, setNewItemImportance] = useState(50);
  const [isAdding, setIsAdding] = useState(false);

  const categories = [
    { value: "distraction", label: "Distraction", color: "from-red-500 to-orange-500", emoji: "📱" },
    { value: "bad_habit", label: "Bad Habit", color: "from-purple-500 to-pink-500", emoji: "🚬" },
    { value: "time_waster", label: "Time Waster", color: "from-yellow-500 to-amber-500", emoji: "⏰" },
    { value: "temptation", label: "Temptation", color: "from-blue-500 to-cyan-500", emoji: "🍰" },
  ];

  useEffect(() => {
    if (notToDoData === null) {
      initializeItems();
    }
  }, [notToDoData, initializeItems]);

  const handleMarkAvoided = async (itemId: string) => {
    try {
      const result = await markAvoided({ itemId });
      if (result.allAvoided) {
        toast.success("🎉 All temptations avoided today! You're unstoppable!");
      }
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const category = categories.find(c => c.value === newItemCategory);
    if (!category) return;

    try {
      await addItem({ 
        title: newItemTitle,
        category: newItemCategory,
        description: newItemDescription || undefined,
        importance: newItemImportance,
        color: category.color,
      });
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemCategory("distraction");
      setNewItemImportance(50);
      setIsAdding(false);
      toast.success("Item added to Not To Do List!");
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem({ itemId });
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  if (!notToDoData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const avoidedCount = notToDoData.items.filter((item: any) => item.successfullyAvoided).length;
  const totalCount = notToDoData.items.length;
  const progressPercent = totalCount > 0 ? Math.round((avoidedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-3 rounded-xl">
                <Ban className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Not To Do List</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Track what you successfully AVOID doing today
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Motivational Quote */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-lg bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border border-red-300 dark:border-red-700"
              >
                <p className="text-sm text-center italic text-red-900 dark:text-red-100">
                  "Discipline is choosing between what you want now and what you want most. Track your victories over temptation."
                </p>
              </motion.div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {avoidedCount} of {totalCount} successfully avoided
                  </span>
                  <span className="text-sm font-semibold">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>

              {/* Weekly Stats */}
              {weeklyStats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{weeklyStats.successRate}%</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Total Avoided</p>
                    <p className="text-2xl font-bold text-blue-600">{weeklyStats.totalAvoided}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Days Tracked</p>
                    <p className="text-2xl font-bold text-purple-600">{weeklyStats.daysTracked}</p>
                  </div>
                </div>
              )}

              {notToDoData.items.length > 0 && avoidedCount === totalCount && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center"
                >
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold text-lg">Perfect Day! 🎉</p>
                  <p className="text-sm opacity-90">You avoided all temptations today!</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Temptations to Avoid</CardTitle>
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Item Form */}
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-4 p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/50"
            >
              <div>
                <Label>What should you avoid?</Label>
                <Input
                  placeholder="e.g., Checking social media, Eating junk food..."
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Why avoid this? (optional)</Label>
                <Textarea
                  placeholder="Remind yourself why this is important..."
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Importance: {newItemImportance}</Label>
                <Slider
                  value={[newItemImportance]}
                  onValueChange={(value) => setNewItemImportance(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddItem} className="cursor-pointer flex-1">Add to List</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewItemTitle("");
                    setNewItemDescription("");
                    setNewItemCategory("distraction");
                    setNewItemImportance(50);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Items */}
          {notToDoData.items.map((item: any, index: number) => {
            const category = categories.find(c => c.value === item.category);
            return (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  item.successfullyAvoided 
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : `bg-gradient-to-r ${item.color} bg-opacity-10 border-red-200 dark:border-red-800`
                }`}
              >
                <div
                  onClick={() => handleMarkAvoided(item.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  {item.successfullyAvoided ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category?.emoji}</span>
                      <span
                        className={`font-medium ${
                          item.successfullyAvoided ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.importance >= 80 ? "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200" :
                        item.importance >= 50 ? "bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" :
                        "bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200"
                      }`}>
                        {item.importance >= 80 ? "Critical" : item.importance >= 50 ? "Important" : "Low"}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteItem(item.id)}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}

          {notToDoData.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Ban className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No items yet. Add things you want to avoid today!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
