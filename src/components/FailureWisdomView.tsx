import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, AlertTriangle, Lightbulb, Layers, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function FailureWisdomView() {
  const entries = useQuery(api.failureWisdom.getEntries);
  const createEntry = useMutation(api.failureWisdom.createEntry);
  const deleteEntry = useMutation(api.failureWisdom.deleteEntry);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeType, setActiveType] = useState<"recurring_mistake" | "single_lesson" | "multi_lesson" | "external_wisdom">("recurring_mistake");

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
        source: activeType === "external_wisdom" ? source : undefined,
        date: new Date().toISOString(),
      });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Wisdom captured.");
    } catch (error) {
      toast.error("Failed to save.");
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

  const handleDelete = async (id: any) => {
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
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "recurring_mistake": return "Recurring Mistakes";
      case "single_lesson": return "Single Lessons";
      case "multi_lesson": return "Deep Analysis";
      case "external_wisdom": return "External Wisdom";
      default: return "Mistakes";
    }
  };

  const filteredEntries = entries?.filter(e => e.type === activeType) || [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
            Failure Vault
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl border-l-4 border-red-600 pl-6 py-2">
            "Success is stumbling from failure to failure with no loss of enthusiasm."
          </p>
        </div>

        {/* Navigation */}
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)} className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-8 overflow-x-auto">
            {["recurring_mistake", "single_lesson", "multi_lesson", "external_wisdom"].map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 px-0 py-4 text-lg font-medium transition-all hover:text-foreground/80"
              >
                <div className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  {getTypeLabel(type)}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-8 flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-105">
                  <Plus className="mr-2 h-5 w-5" />
                  Log Failure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background border-border">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tight">
                    Log {getTypeLabel(activeType)}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Title / The Mistake</label>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="What happened?"
                      className="bg-muted/50 border-none text-lg font-medium p-6 h-auto focus-visible:ring-red-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Context & Details</label>
                    <Textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Describe the situation deeply..."
                      className="bg-muted/50 border-none min-h-[120px] p-4 focus-visible:ring-red-600"
                    />
                  </div>

                  {activeType === "recurring_mistake" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Frequency</label>
                        <Input 
                          value={frequency} 
                          onChange={(e) => setFrequency(e.target.value)} 
                          placeholder="e.g., Weekly, When stressed"
                          className="bg-muted/50 border-none focus-visible:ring-red-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Prevention Strategy</label>
                        <Input 
                          value={preventionStrategy} 
                          onChange={(e) => setPreventionStrategy(e.target.value)} 
                          placeholder="How to stop it?"
                          className="bg-muted/50 border-none focus-visible:ring-red-600"
                        />
                      </div>
                    </div>
                  )}

                  {activeType === "external_wisdom" && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Source / Person</label>
                      <Input 
                        value={source} 
                        onChange={(e) => setSource(e.target.value)} 
                        placeholder="Who made this mistake?"
                        className="bg-muted/50 border-none focus-visible:ring-red-600"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Key Lessons</label>
                      <Button variant="ghost" size="sm" onClick={handleAddLesson} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                        <Plus className="h-4 w-4 mr-1" /> Add Lesson
                      </Button>
                    </div>
                    {lessons.map((lesson, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={lesson} 
                          onChange={(e) => handleLessonChange(index, e.target.value)} 
                          placeholder={`Lesson ${index + 1}`}
                          className="bg-muted/50 border-none focus-visible:ring-red-600"
                        />
                        {lessons.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveLesson(index)}>
                            <X className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSubmit} className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-lg font-bold mt-4">
                    Commit to Vault
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value={activeType} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <Card className="h-full bg-card border-border hover:border-red-600/50 transition-all duration-300 group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-xl font-bold leading-tight">{entry.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {entry.source && (
                          <Badge variant="outline" className="w-fit mt-2 border-red-600/30 text-red-600">
                            {entry.source}
                          </Badge>
                        )}
                        {entry.frequency && (
                          <Badge variant="secondary" className="w-fit mt-2">
                            {entry.frequency}
                          </Badge>
                        )}
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {entry.description}
                        </p>
                        
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">
                            Key Takeaways
                          </h4>
                          <ul className="space-y-2">
                            {entry.lessons.map((lesson, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-medium">
                                <span className="text-red-600 mt-1.5">•</span>
                                <span>{lesson}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {entry.preventionStrategy && (
                          <div className="pt-4 border-t border-border/50">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 mb-2">
                              Prevention Strategy
                            </h4>
                            <p className="text-sm font-medium text-red-600">
                              {entry.preventionStrategy}
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-4 text-xs text-muted-foreground/50 font-mono">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredEntries.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center opacity-50">
                  <div className="bg-muted rounded-full p-6 mb-4">
                    {getTypeIcon(activeType)}
                  </div>
                  <h3 className="text-xl font-bold mb-2">No entries yet</h3>
                  <p className="text-muted-foreground">The vault is empty. Start documenting your journey.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
