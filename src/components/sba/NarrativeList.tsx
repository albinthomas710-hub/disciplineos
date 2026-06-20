import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Save, Trash2, Calendar, PenLine, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface NarrativeListProps {
  memories: any[];
}

export function NarrativeList({ memories }: NarrativeListProps) {
  const updateMemory = useMutation(api.sba.updateMemory);
  const deleteMemory = useMutation(api.sba.deleteMemory);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Sort memories by date
  const sortedMemories = memories?.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <BookOpen className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold tracking-tight text-white">
          THE CHRONICLES
        </h2>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest ml-auto">
          {memories.length} ENTRIES
        </span>
      </div>

      <div className="space-y-4">
        {sortedMemories.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-gray-500 text-sm font-medium">No narratives recorded yet.</p>
            <p className="text-xs text-gray-600 mt-1">Upload evidence above to begin your story.</p>
          </div>
        ) : (
          sortedMemories.map((memory) => (
            <NarrativeItem 
              key={memory._id} 
              memory={memory} 
              isExpanded={expandedId === memory._id}
              onToggle={() => setExpandedId(expandedId === memory._id ? null : memory._id)}
              onUpdate={updateMemory}
              onDelete={deleteMemory}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NarrativeItem({ 
  memory, 
  isExpanded, 
  onToggle, 
  onUpdate, 
  onDelete 
}: { 
  memory: any, 
  isExpanded: boolean, 
  onToggle: () => void,
  onUpdate: any,
  onDelete: any
}) {
  const [title, setTitle] = useState(memory.title);
  const [story, setStory] = useState(memory.story);
  const [date, setDate] = useState(memory.date);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await onUpdate({
        id: memory._id,
        title,
        story,
        date
      });
      toast.success("Narrative updated.");
      setIsEditing(false);
    } catch (e) {
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this memory permanently?")) {
      await onDelete({ id: memory._id });
      toast.success("Memory deleted.");
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border transition-all duration-300 overflow-hidden",
        isExpanded 
          ? "bg-[#0f1219] border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)]" 
          : "bg-white/5 border-white/5 hover:border-white/10"
      )}
    >
      {/* Header / Summary */}
      <div 
        onClick={onToggle}
        className="p-4 flex items-center gap-4 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 relative">
          {(memory.displayUrl || memory.imageUrl) ? (
            <img src={memory.displayUrl || memory.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="w-full h-full bg-white/5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-cyan-500/80 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-900/30">
              {date}
            </span>
          </div>
          <h3 className={cn(
            "font-bold text-sm tracking-wide truncate transition-colors",
            isExpanded ? "text-white" : "text-gray-400 group-hover:text-gray-200"
          )}>
            {title}
          </h3>
        </div>

        <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-6 space-y-6">
              {/* Edit Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 h-10 font-bold tracking-wide"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</label>
                    <Input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 h-10 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">The Story</label>
                  <Textarea 
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="bg-white/5 border-white/10 text-gray-300 focus:border-purple-500/50 min-h-[150px] leading-relaxed resize-none p-4"
                    placeholder="Write the legend..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-900/50 hover:text-red-400 hover:bg-red-950/10 h-8 px-2"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Delete</span>
                </Button>

                <Button 
                  onClick={handleSave}
                  className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 h-8 px-6"
                >
                  <Save className="w-3 h-3 mr-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Save Changes</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
