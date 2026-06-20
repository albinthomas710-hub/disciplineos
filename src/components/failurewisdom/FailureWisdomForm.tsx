import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";

interface FailureWisdomFormProps {
  activeType: "recurring_mistake" | "single_lesson" | "multi_lesson" | "external_wisdom" | "titan_failures";
  getTypeLabel: (type: string) => string;
}

export function FailureWisdomForm({ activeType, getTypeLabel }: FailureWisdomFormProps) {
  const convex = useConvex();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessons, setLessons] = useState<string[]>([""]);
  const [frequency, setFrequency] = useState("");
  const [preventionStrategy, setPreventionStrategy] = useState("");
  const [source, setSource] = useState("");

  const handleAddLesson = () => setLessons([...lessons, ""]);
  const handleLessonChange = (index: number, value: string) => {
    const newLessons = [...lessons];
    newLessons[index] = value;
    setLessons(newLessons);
  };
  const handleRemoveLesson = (index: number) => {
    const newLessons = lessons.filter((_, i) => i !== index);
    setLessons(newLessons);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLessons([""]);
    setFrequency("");
    setPreventionStrategy("");
    setSource("");
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }

    try {
      await convex.mutation("failureWisdom:createEntry" as any, {
        type: activeType,
        title,
        description,
        lessons: lessons.filter(l => l.trim() !== ""),
        date: new Date().toISOString(),
        frequency: frequency || "",
        preventionStrategy: preventionStrategy || "",
        source: source || "",
      });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Wisdom captured.");
    } catch (error) {
      toast.error("Failed to save.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="group relative bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl px-8 py-6 text-base font-bold shadow-2xl shadow-red-600/20 transition-all hover:scale-[1.02] hover:shadow-red-600/30 border-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
          <Plus className="mr-2 h-5 w-5" />
          Log Mistake
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-red-700 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {getTypeLabel(activeType)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-neutral-500">The Mistake</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What happened?"
              className="bg-gray-50 dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 text-lg font-medium px-6 py-6 h-auto focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-neutral-500">Context & Details</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe the situation deeply..."
              className="bg-gray-50 dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 min-h-[140px] px-6 py-4 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl resize-none"
            />
          </div>

          {activeType === "recurring_mistake" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-neutral-500">Frequency</label>
                <Input 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)} 
                  placeholder="e.g., Weekly, When stressed"
                  className="bg-gray-50 dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-neutral-500">Prevention Strategy</label>
                <Input 
                  value={preventionStrategy} 
                  onChange={(e) => setPreventionStrategy(e.target.value)} 
                  placeholder="How to stop it?"
                  className="bg-gray-50 dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
                />
              </div>
            </div>
          )}

          {(activeType === "external_wisdom" || activeType === "titan_failures") && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-neutral-500">Source / Person</label>
              <Input 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                placeholder="Who made this mistake?"
                className="bg-gray-50 dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-neutral-500">Key Lessons</label>
              <Button variant="ghost" size="sm" onClick={handleAddLesson} className="text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg">
                <Plus className="h-4 w-4 mr-1" /> Add Lesson
              </Button>
            </div>
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div key={index} className="flex gap-3">
                  <Input 
                    value={lesson} 
                    onChange={(e) => handleLessonChange(index, e.target.value)} 
                    placeholder={`Lesson ${index + 1}`}
                    className="bg-gray-50 dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
                  />
                  {lessons.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLesson(index)} className="hover:bg-red-950/30 rounded-xl">
                      <X className="h-4 w-4 text-neutral-500 hover:text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white h-14 text-lg font-bold mt-6 rounded-xl shadow-lg shadow-red-600/20">
            Commit to Vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
