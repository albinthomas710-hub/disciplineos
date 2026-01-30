import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image as ImageIcon, Calendar, BookOpen, Sparkles, ChevronRight, Upload, Maximize2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";

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

      toast.success("Memory enshrined forever.");
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

  const sortedMemories = memories?.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 -m-4 sm:-m-6 lg:-m-8 font-sans selection:bg-white/20">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white text-black rounded-full flex items-center justify-center font-black text-xl tracking-tighter">
              SBA
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Life Story Worksheet</h1>
              <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">See • Believe • Achieve</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-medium tracking-wide transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD MEMORY
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-12">
        {/* Hero / Intro */}
        <div className="relative rounded-3xl overflow-hidden bg-zinc-900/50 border border-white/5 p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800/30 via-zinc-950/0 to-zinc-950/0" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-medium tracking-tight text-white"
            >
              The Story Thus Far
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-zinc-400 leading-relaxed font-light"
            >
              Your life is a collection of moments that define who you are. 
              Curate your history with the elegance it deserves.
            </motion.p>
          </div>
        </div>

        {/* Premium Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {sortedMemories.map((memory, index) => (
              <motion.div
                key={memory._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelectedMemory(memory)}
                className="group cursor-pointer relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl shadow-black/50"
              >
                {/* Image Layer */}
                <div className="absolute inset-0 bg-zinc-800">
                  {memory.imageStorageId ? (
                    <img 
                      src={`${window.location.origin}/api/storage/${memory.imageStorageId}`} 
                      alt={memory.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <ImageIcon className="w-12 h-12 text-zinc-800" />
                    </div>
                  )}
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Content Layer */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="flex items-center gap-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-white border border-white/10">
                        {new Date(memory.date).getFullYear()}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-2 drop-shadow-lg">
                      {memory.title}
                    </h3>
                    
                    <div className="h-px w-12 bg-white/50 group-hover:w-full transition-all duration-700 ease-out opacity-50" />
                    
                    <p className="mt-4 text-sm text-zinc-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 font-light leading-relaxed">
                      {memory.story}
                    </p>
                  </div>
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000" />
                </div>
              </motion.div>
            ))}

            {/* Add Card (Always visible if empty or at end) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsAddOpen(true)}
              className="aspect-[4/5] rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-600 bg-zinc-900/20 hover:bg-zinc-900/50 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300 group"
            >
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 group-hover:scale-110 flex items-center justify-center transition-all duration-500 shadow-xl">
                <Plus className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-zinc-400 group-hover:text-white font-medium tracking-wide transition-colors">
                  Add New Memory
                </p>
                <p className="text-xs text-zinc-600 uppercase tracking-widest">
                  Capture the moment
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Add Dialog - Premium */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl p-0 overflow-hidden gap-0 shadow-2xl shadow-black">
          <div className="p-8 border-b border-zinc-800 bg-zinc-900/50">
            <DialogHeader>
              <DialogTitle className="text-3xl font-light tracking-tight text-white">Enshrine a Memory</DialogTitle>
              <p className="text-zinc-500 text-sm">Add a new chapter to your life's story.</p>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Title</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 focus:border-white/20 focus:ring-0 text-lg font-medium h-12 rounded-xl transition-all"
                  placeholder="e.g. The Beginning"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Date</Label>
                <Input 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 focus:border-white/20 focus:ring-0 h-12 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Visual Evidence</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-40 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-600 transition-all group"
              >
                {selectedImage ? (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-zinc-300 font-medium">{selectedImage.name}</p>
                    <p className="text-xs text-zinc-500">Click to replace</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Upload Photo</p>
                    <p className="text-xs text-zinc-600">Supports JPG, PNG</p>
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
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">The Deep Story</Label>
              <Textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 focus:border-white/20 focus:ring-0 min-h-[150px] leading-relaxed rounded-xl resize-none p-4 text-zinc-300"
                placeholder="Write the story deeply..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsAddOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              CANCEL
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-zinc-200 px-8 rounded-full font-medium tracking-wide"
            >
              {isSubmitting ? "SAVING..." : "IMMORTALIZE"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Memory Dialog - Immersive */}
      <Dialog open={!!selectedMemory} onOpenChange={(open) => !open && setSelectedMemory(null)}>
        <DialogContent className="bg-black border-zinc-800 text-zinc-100 max-w-6xl p-0 overflow-hidden h-[90vh] flex flex-col md:flex-row shadow-2xl shadow-black/90">
          {selectedMemory && (
            <>
              {/* Image Side */}
              <div className="w-full md:w-[55%] h-64 md:h-full relative bg-zinc-900 group">
                {selectedMemory.imageStorageId ? (
                  <img 
                    src={`${window.location.origin}/api/storage/${selectedMemory.imageStorageId}`} 
                    alt={selectedMemory.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-20 h-20 text-zinc-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/80" />
                
                {/* Date Badge */}
                <div className="absolute top-8 left-8">
                  <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-xs font-bold tracking-widest uppercase text-white">
                    {new Date(selectedMemory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              
              {/* Content Side */}
              <div className="w-full md:w-[45%] flex flex-col bg-black relative">
                <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
                
                <ScrollArea className="flex-1 p-10 md:p-16">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-[0.9]">
                        {selectedMemory.title}
                      </h2>
                      <div className="h-1 w-24 bg-white rounded-full" />
                    </div>
                    
                    <div className="prose prose-invert prose-lg max-w-none">
                      <p className="text-zinc-400 leading-loose font-light text-lg whitespace-pre-wrap">
                        {selectedMemory.story}
                      </p>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-8 border-t border-white/5 bg-zinc-950/50 flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors gap-2"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this memory?")) {
                        await deleteMemory({ id: selectedMemory._id });
                        setSelectedMemory(null);
                        toast.success("Memory removed.");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Memory
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedMemory(null)}
                    className="border-white/10 hover:bg-white/5 text-zinc-300"
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
