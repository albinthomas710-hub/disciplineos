import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, AlertTriangle, Lightbulb, Layers, User, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FailureEntry {
  _id: Id<"failureWisdom">;
  _creationTime: number;
  userId: Id<"users">;
  type: "recurring_mistake" | "single_lesson" | "multi_lesson" | "external_wisdom" | "titan_failures";
  title: string;
  description: string;
  lessons: string[];
  frequency?: string;
  preventionStrategy?: string;
  source?: string;
  tags?: string[];
  date: string;
}

export function FailureWisdomView() {
  const entries = useQuery((api as any).failureWisdom.getEntries) as FailureEntry[] | undefined;
  const createEntry = useMutation((api as any).failureWisdom.createEntry);
  const deleteEntry = useMutation((api as any).failureWisdom.deleteEntry);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeType, setActiveType] = useState<"recurring_mistake" | "single_lesson" | "multi_lesson" | "external_wisdom" | "titan_failures">("recurring_mistake");

  // Form State
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

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }

    try {
      await createEntry({
        type: activeType,
        title,
        description,
        lessons: lessons.filter(l => l.trim() !== ""),
        frequency: activeType === "recurring_mistake" ? frequency : undefined,
        preventionStrategy: activeType === "recurring_mistake" ? preventionStrategy : undefined,
        source: (activeType === "external_wisdom" || activeType === "titan_failures") ? source : undefined,
        date: new Date().toISOString(),
      });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Wisdom captured.");
    } catch (error) {
      toast.error("Failed to save.");
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLessons([""]);
    setFrequency("");
    setPreventionStrategy("");
    setSource("");
  };

  const handleDelete = async (id: Id<"failureWisdom">) => {
    if (confirm("Forget this lesson?")) {
      await deleteEntry({ id });
      toast.success("Deleted.");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "recurring_mistake": return <AlertTriangle className="h-5 w-5" />;
      case "single_lesson": return <Lightbulb className="h-5 w-5" />;
      case "multi_lesson": return <Layers className="h-5 w-5" />;
      case "external_wisdom": return <User className="h-5 w-5" />;
      case "titan_failures": return <Sparkles className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "recurring_mistake": return "Mistakes I Keep Making";
      case "single_lesson": return "One-Time Mistakes";
      case "multi_lesson": return "Multiple Lessons From One Mistake";
      case "external_wisdom": return "Learning From Others' Mistakes";
      case "titan_failures": return "Lessons From Successful People";
      default: return "Mistakes";
    }
  };

  const filteredEntries = entries?.filter((e: FailureEntry) => e.type === activeType) || [];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-stone-950 text-foreground overflow-hidden">
      {/* Textured Background Layer */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium tracking-wide text-red-400">Learning Archive</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            Mistake<br />Vault
          </h1>
          
          <div className="max-w-2xl">
            <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed font-light border-l-2 border-red-600 pl-8 py-3">
              "Success is stumbling from failure to failure with no loss of enthusiasm."
            </p>
            <p className="text-sm text-neutral-600 mt-4 pl-8">— Winston Churchill</p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)} className="w-full">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-12">
            <TabsList className="w-full lg:w-auto bg-transparent border-b border-neutral-800 rounded-none h-auto p-0 gap-0 overflow-x-auto flex-nowrap">
              {[
                { value: "recurring_mistake", label: "Recurring" },
                { value: "single_lesson", label: "One-Time" },
                { value: "multi_lesson", label: "Deep Dive" },
                { value: "external_wisdom", label: "Others" },
                { value: "titan_failures", label: "Titans" }
              ].map((tab, index) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 px-6 py-4 text-base font-semibold transition-all hover:text-neutral-300 data-[state=active]:text-red-500 whitespace-nowrap"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    {getTypeIcon(tab.value)}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.div>
                </TabsTrigger>
              ))}
            </TabsList>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="group relative bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl px-8 py-6 text-base font-bold shadow-2xl shadow-red-600/20 transition-all hover:scale-[1.02] hover:shadow-red-600/30 border-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  <Plus className="mr-2 h-5 w-5" />
                  Log Mistake
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-neutral-950 border border-neutral-800 rounded-3xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                    {getTypeLabel(activeType)}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">The Mistake</label>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="What happened?"
                      className="bg-neutral-900/50 border-neutral-800 text-lg font-medium px-6 py-6 h-auto focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Context & Details</label>
                    <Textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Describe the situation deeply..."
                      className="bg-neutral-900/50 border-neutral-800 min-h-[140px] px-6 py-4 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl resize-none"
                    />
                  </div>

                  {activeType === "recurring_mistake" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Frequency</label>
                        <Input 
                          value={frequency} 
                          onChange={(e) => setFrequency(e.target.value)} 
                          placeholder="e.g., Weekly, When stressed"
                          className="bg-neutral-900/50 border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Prevention Strategy</label>
                        <Input 
                          value={preventionStrategy} 
                          onChange={(e) => setPreventionStrategy(e.target.value)} 
                          placeholder="How to stop it?"
                          className="bg-neutral-900/50 border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
                        />
                      </div>
                    </div>
                  )}

                  {(activeType === "external_wisdom" || activeType === "titan_failures") && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Source / Person</label>
                      <Input 
                        value={source} 
                        onChange={(e) => setSource(e.target.value)} 
                        placeholder="Who made this mistake?"
                        className="bg-neutral-900/50 border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Key Lessons</label>
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
                            className="bg-neutral-900/50 border-neutral-800 focus-visible:ring-red-600 focus-visible:border-red-600 rounded-xl px-4 py-3"
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
          </div>

          <TabsContent value={activeType} className="mt-0">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry: FailureEntry, index: number) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.05,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    layout
                  >
                    <Card className="group relative h-full bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 border border-neutral-800 hover:border-red-600/30 transition-all duration-500 overflow-hidden backdrop-blur-sm rounded-2xl">
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-orange-600/0 group-hover:from-red-600/5 group-hover:via-red-600/5 group-hover:to-orange-600/5 transition-all duration-500 pointer-events-none" />
                      
                      {/* Left Accent Bar */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="relative pb-4">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-xl font-bold leading-tight text-white group-hover:text-red-400 transition-colors duration-300">
                            {entry.title}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry._id)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-neutral-500 hover:text-red-500 hover:bg-red-950/30 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {entry.source && (
                            <Badge variant="outline" className="border-red-600/30 text-red-500 bg-red-950/20 rounded-lg px-3 py-1">
                              {entry.source}
                            </Badge>
                          )}
                          {entry.frequency && (
                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 rounded-lg px-3 py-1">
                              {entry.frequency}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative space-y-6">
                        <p className="text-neutral-400 text-sm leading-relaxed">
                          {entry.description}
                        </p>
                        
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                            Key Takeaways
                          </h4>
                          <ul className="space-y-2">
                            {entry.lessons.map((lesson: string, i: number) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 text-sm font-medium text-neutral-300"
                              >
                                <span className="text-red-500 mt-1 text-lg leading-none">•</span>
                                <span>{lesson}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        {entry.preventionStrategy && (
                          <div className="pt-4 border-t border-neutral-800/50">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2">
                              Prevention Strategy
                            </h4>
                            <p className="text-sm font-semibold text-red-500">
                              {entry.preventionStrategy}
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-4 text-[10px] text-neutral-600 font-mono tracking-wider">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredEntries.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl" />
                    <div className="relative bg-neutral-900 rounded-full p-8 border border-neutral-800">
                      {getTypeIcon(activeType)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-neutral-300">No entries yet</h3>
                  <p className="text-neutral-500 max-w-md">The vault is empty. Start documenting your journey to wisdom.</p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}