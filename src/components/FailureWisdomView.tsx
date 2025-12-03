import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Lightbulb, Layers, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FailureWisdomHeader } from "./failurewisdom/FailureWisdomHeader";
import { FailureWisdomCard } from "./failurewisdom/FailureWisdomCard";
import { FailureWisdomForm } from "./failurewisdom/FailureWisdomForm";
import { FailureWisdomSearch } from "./failurewisdom/FailureWisdomSearch";

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
  const entries = useQuery("failureWisdom:getEntries" as any) as FailureEntry[] | undefined;
  const deleteEntry = useMutation("failureWisdom:deleteEntry" as any);

  const [activeType, setActiveType] = useState<"recurring_mistake" | "single_lesson" | "multi_lesson" | "external_wisdom" | "titan_failures">("recurring_mistake");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    
    let filtered = entries.filter((e: FailureEntry) => e.type === activeType);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e: FailureEntry) => 
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.lessons.some(l => l.toLowerCase().includes(query)) ||
        (e.source && e.source.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [entries, activeType, searchQuery]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20 text-foreground overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-400/10 dark:bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <FailureWisdomHeader />

        {/* Navigation Tabs */}
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)} className="w-full">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-12">
            <TabsList className="w-full lg:w-auto bg-white/50 dark:bg-transparent border-b border-gray-300 dark:border-neutral-800 rounded-none h-auto p-0 gap-0 overflow-x-auto flex-nowrap">
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
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 px-6 py-4 text-base font-semibold transition-all hover:text-red-600 data-[state=active]:text-red-600 whitespace-nowrap text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-300"
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

            <FailureWisdomForm activeType={activeType} getTypeLabel={getTypeLabel} />
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <FailureWisdomSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>

          <TabsContent value={activeType} className="mt-0">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry: FailureEntry, index: number) => (
                  <FailureWisdomCard 
                    key={entry._id}
                    entry={entry}
                    index={index}
                    onDelete={handleDelete}
                  />
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
                    <div className="relative bg-white dark:bg-neutral-900 rounded-full p-8 border border-gray-200 dark:border-neutral-800">
                      {getTypeIcon(activeType)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-700 dark:text-neutral-300">
                    {searchQuery ? "No matches found" : "No entries yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-neutral-500 max-w-md">
                    {searchQuery ? "Try a different search term" : "The vault is empty. Start documenting your journey to wisdom."}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}