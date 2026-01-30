import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image as ImageIcon, Rocket, Trash2, Upload, Loader2, Crown, Flame, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export function SBAWorksheetView() {
  const memories = useQuery(api.sba.getMemories);
  const createMemory = useMutation(api.sba.createMemory);
  const generateUploadUrl = useMutation(api.sba.generateUploadUrl);
  const deleteMemory = useMutation(api.sba.deleteMemory);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !story) {
      toast.error("Every memory needs a title and a story.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageStorageId: Id<"_storage"> | undefined = undefined;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      await createMemory({
        title,
        story,
        date,
        imageStorageId,
      });

      toast.success("Memory enshrined.");
      setIsAddOpen(false);
      setTitle("");
      setStory("");
      setSelectedImage(null);
    } catch (e) {
      toast.error("Failed to save memory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort memories by date
  const sortedMemories = memories?.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // Grid generation: 9 slots
  const gridSlots = Array.from({ length: 9 }, (_, i) => {
    return sortedMemories[i] || null;
  });

  return (
    <div className="min-h-screen bg-[#0b0d14] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d14] via-[#0f1219] to-[#0b0d14]" />
        
        {/* Floating Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, 50, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium tracking-widest uppercase text-purple-200/80">Identity Architecture</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              STORY THUS FAR
            </span>
          </h1>
          
          <p className="text-sm md:text-base font-medium tracking-wide text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <span className="text-cyan-400">I AM SOMEONE WHO</span> DOCUMENTS THE JOURNEY.
            <br />
            FROM THE BEGINNING TO THE LEGEND.
          </p>
        </motion.div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {gridSlots.map((memory, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative aspect-[4/5] group"
            >
              <div 
                onClick={() => {
                  if (memory) {
                    setSelectedMemory(memory);
                  } else {
                    setIsAddOpen(true);
                  }
                }}
                className={cn(
                  "w-full h-full rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-500",
                  "bg-white/5 backdrop-blur-xl border border-white/10",
                  "hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] hover:border-cyan-500/30",
                  !memory && "border-dashed border-white/5 hover:border-cyan-500/20 hover:bg-white/10"
                )}
              >
                {/* Gradient Top Line */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                  memory ? "from-cyan-500 via-purple-500 to-cyan-500" : "from-transparent via-white/10 to-transparent"
                )} />

                {memory ? (
                  <>
                    {(memory.displayUrl || memory.imageUrl) ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={memory.displayUrl || memory.imageUrl} 
                          alt={memory.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-transparent opacity-80" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/10" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
                          {new Date(memory.date).getFullYear()}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-lg tracking-wide uppercase mb-1 line-clamp-1 group-hover:text-cyan-100 transition-colors">
                        {memory.title}
                      </h3>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-6 group-hover:gap-4 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] transition-all duration-500">
                      {index === 4 ? (
                        <Rocket className="w-6 h-6 text-white/40 group-hover:text-cyan-400 transition-colors" />
                      ) : (
                        <Plus className="w-6 h-6 text-white/40 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase group-hover:text-cyan-400/80 transition-colors">
                      Enshrine Memory
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Dialog - High End Glass */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0f1219]/95 backdrop-blur-2xl border-white/10 text-white max-w-xl p-0 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.7)]">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
          
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Crown className="w-8 h-8 text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  ENSHRINE LEGACY
                </span>
              </DialogTitle>
              <p className="text-gray-400 text-sm font-medium">
                Capture a pivotal moment in your journey.
              </p>
            </DialogHeader>
          
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Title</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 text-white h-12 rounded-xl font-medium tracking-wide placeholder:text-white/20"
                  placeholder="THE TURNING POINT"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Date</Label>
                <Input 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 text-white h-12 rounded-xl font-mono"
                />
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
              >
                {selectedImage ? (
                  <div className="text-center z-10">
                    <p className="text-cyan-400 font-bold flex items-center gap-2 justify-center">
                      <Sparkles className="w-4 h-4" />
                      {selectedImage.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">CLICK TO REPLACE</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 z-10">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm group-hover:text-white transition-colors uppercase tracking-wider">Upload Evidence</p>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSelect}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">The Story</Label>
                <Textarea 
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 text-white min-h-[120px] rounded-xl resize-none p-4 leading-relaxed placeholder:text-white/20"
                  placeholder="Describe the victory or the lesson..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/5 uppercase tracking-wider font-bold text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 rounded-xl px-8 font-bold tracking-wider uppercase shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] border border-cyan-400/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "IMMORTALIZE"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog - Premium Lightbox */}
      <Dialog open={!!selectedMemory} onOpenChange={(open) => !open && setSelectedMemory(null)}>
        <DialogContent className="bg-[#0f1219]/95 backdrop-blur-2xl border-white/10 text-white max-w-5xl p-0 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.9)] flex flex-col md:flex-row h-[85vh]">
          {selectedMemory && (
            <>
              <div className="w-full md:w-3/5 h-64 md:h-full bg-black relative group">
                {(selectedMemory.displayUrl || selectedMemory.imageUrl) ? (
                  <img 
                    src={selectedMemory.displayUrl || selectedMemory.imageUrl} 
                    alt={selectedMemory.title}
                    className="w-full h-full object-contain bg-black/50"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                    <ImageIcon className="w-24 h-24 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                      {new Date(selectedMemory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-2xl leading-none">
                    {selectedMemory.title}
                  </h2>
                </div>
              </div>
              
              <div className="w-full md:w-2/5 flex flex-col bg-[#0f1219] border-l border-white/5">
                <div className="p-8 border-b border-white/5">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Memory Log</span>
                  </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  <p className="text-lg text-gray-300 leading-loose font-light whitespace-pre-wrap">
                    {selectedMemory.story}
                  </p>
                </div>
                
                <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    onClick={async () => {
                      if (confirm("Delete this memory?")) {
                        await deleteMemory({ id: selectedMemory._id });
                        setSelectedMemory(null);
                        toast.success("Memory deleted.");
                      }
                    }}
                    className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 uppercase tracking-wider font-bold text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedMemory(null)}
                    className="border-white/10 text-white hover:bg-white hover:text-black uppercase tracking-wider font-bold rounded-xl"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}