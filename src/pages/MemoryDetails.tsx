import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Save, Sparkles, Eye, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MemoryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const memory = useQuery(api.sba.getMemory, id ? { id: id as Id<"sbaMemories"> } : "skip");
  const updateMemory = useMutation(api.sba.updateMemory);
  const deleteMemory = useMutation(api.sba.deleteMemory);

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [date, setDate] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setStory(memory.story);
      setDate(memory.date);
    }
  }, [memory]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateMemory({
        id: id as Id<"sbaMemories">,
        title,
        story,
        date,
      });
      toast.success("Chronicle updated.");
      setIsDirty(false);
    } catch (e) {
      toast.error("Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to erase this memory forever?")) return;
    try {
      await deleteMemory({ id: id as Id<"sbaMemories"> });
      toast.success("Memory erased.");
      navigate("/");
    } catch (e) {
      toast.error("Failed to delete.");
    }
  };

  if (memory === undefined) {
    return <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center text-white">Loading chronicle...</div>;
  }

  if (memory === null) {
    return <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center text-white">Memory not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] text-white font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard?tab=sba")}
            className="text-gray-400 hover:text-white hover:bg-white/5 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SBA Worksheet
          </Button>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={handleDelete}
              className="text-red-900/50 hover:text-red-400 hover:bg-red-950/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Erase
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!isDirty}
              className={cn(
                "min-w-[120px] transition-all duration-300",
                isDirty 
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              {isDirty ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: The Mirror (Image) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">The Mirror</span>
              </div>
              <h2 className="text-2xl font-bold text-white/90">Witness What Was</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Visual evidence of your journey. This moment is now immortalized in your timeline.
              </p>
            </div>

            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-[#0f1219] shadow-2xl group">
              {(memory.displayUrl || memory.imageUrl) ? (
                <>
                  <img 
                    src={memory.displayUrl || memory.imageUrl} 
                    alt={memory.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <span className="text-white/20 font-mono text-xs">NO VISUAL RECORD</span>
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 mb-3">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setIsDirty(true); }}
                    className="bg-transparent border-none text-xs font-mono text-cyan-100 focus:ring-0 p-0 w-24"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: The Narrative */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title of Memory</label>
                <Input 
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                  className="text-3xl md:text-4xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-white/20 text-white"
                  placeholder="UNTITLED CHRONICLE"
                />
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500" />
                
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">The Narrative</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 italic">
                    "Before we can grow, we must see clearly. Describe this moment—what you felt, what you achieved, and why it matters."
                  </p>
                </div>

                <Textarea 
                  value={story}
                  onChange={(e) => { setStory(e.target.value); setIsDirty(true); }}
                  className="min-h-[300px] bg-black/20 border-white/5 text-lg leading-relaxed text-gray-200 focus:border-purple-500/30 resize-none p-6 rounded-xl"
                  placeholder="Write the legend..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Psychological Anchor</h3>
                  <p className="text-xs text-gray-500">
                    Writing this memory reinforces your identity as someone who documents their growth.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Legacy Value</h3>
                  <p className="text-xs text-gray-500">
                    This entry is now part of your permanent archive, accessible for future reflection.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
