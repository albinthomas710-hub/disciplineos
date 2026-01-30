import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image as ImageIcon, Rocket, Trash2, Upload, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#E0E7D1] font-sans selection:bg-[#E0E7D1] selection:text-black overflow-hidden relative">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.15] pointer-events-none z-0 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      
      {/* Red Glow Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-red-900/40 via-transparent to-transparent pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase scale-x-110 transform origin-center text-[#E0E7D1] drop-shadow-[0_0_15px_rgba(224,231,209,0.1)]">
            Story Thus Far
          </h1>
          <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#E0E7D1]/60 uppercase max-w-2xl mx-auto leading-relaxed">
            Add photos showing snippets of your life all the way from your childhood to now
          </p>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl aspect-square">
          {gridSlots.map((memory, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="relative aspect-square group"
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
                  "w-full h-full rounded-3xl border border-[#E0E7D1]/20 bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-500",
                  "hover:border-[#E0E7D1]/60 hover:bg-black/60 hover:shadow-[0_0_30px_-5px_rgba(224,231,209,0.1)]",
                  memory ? "border-[#E0E7D1]/40" : "border-dashed border-[#E0E7D1]/10"
                )}
              >
                {memory ? (
                  <>
                    {memory.imageStorageId ? (
                      <img 
                        src={`${window.location.origin}/api/storage/${memory.imageStorageId}`} 
                        alt={memory.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-[#E0E7D1]/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-[#E0E7D1] font-bold text-sm truncate uppercase tracking-wider">{memory.title}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4">
                    {index === 4 ? (
                      // Center slot gets the Rocket if empty
                      <Rocket className="w-20 h-20 text-[#E0E7D1] fill-[#E0E7D1] rotate-45 drop-shadow-[0_0_15px_rgba(224,231,209,0.3)]" />
                    ) : (
                      <span className="text-[#E0E7D1] font-black text-xl tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                        Picture
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Dialog - Brutalist Style */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#E0E7D1]/20 text-[#E0E7D1] max-w-xl p-0 overflow-hidden shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)]">
          <div className="p-8 border-b border-[#E0E7D1]/10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-[#E0E7D1]">Enshrine Memory</DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#E0E7D1]/50 uppercase tracking-widest">Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#111] border-[#E0E7D1]/10 focus:border-[#E0E7D1]/50 text-[#E0E7D1] h-12 rounded-lg font-bold tracking-wide"
                placeholder="THE BEGINNING"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#E0E7D1]/50 uppercase tracking-widest">Date</Label>
              <Input 
                type="date"
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#111] border-[#E0E7D1]/10 focus:border-[#E0E7D1]/50 text-[#E0E7D1] h-12 rounded-lg"
              />
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-32 border-2 border-dashed border-[#E0E7D1]/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#111] hover:border-[#E0E7D1]/50 transition-all group"
            >
              {selectedImage ? (
                <div className="text-center">
                  <p className="text-[#E0E7D1] font-bold">{selectedImage.name}</p>
                  <p className="text-xs text-[#E0E7D1]/50 mt-1">CLICK TO REPLACE</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="w-8 h-8 text-[#E0E7D1]/40 mx-auto group-hover:text-[#E0E7D1] transition-colors" />
                  <p className="text-[#E0E7D1]/40 font-bold text-sm group-hover:text-[#E0E7D1] transition-colors uppercase tracking-wider">Upload Evidence</p>
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
              <Label className="text-xs font-bold text-[#E0E7D1]/50 uppercase tracking-widest">The Story</Label>
              <Textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="bg-[#111] border-[#E0E7D1]/10 focus:border-[#E0E7D1]/50 text-[#E0E7D1] min-h-[120px] rounded-lg resize-none p-4 leading-relaxed"
                placeholder="Write the legend..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-[#E0E7D1]/10 bg-[#0f0f0f] flex justify-end gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsAddOpen(false)}
              className="text-[#E0E7D1]/50 hover:text-[#E0E7D1] hover:bg-white/5 uppercase tracking-wider font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#E0E7D1] text-black hover:bg-white rounded-lg px-8 font-black tracking-wider uppercase"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "IMMORTALIZE"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog - Brutalist Style */}
      <Dialog open={!!selectedMemory} onOpenChange={(open) => !open && setSelectedMemory(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#E0E7D1]/20 text-[#E0E7D1] max-w-4xl p-0 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,1)] flex flex-col md:flex-row h-[80vh]">
          {selectedMemory && (
            <>
              <div className="w-full md:w-1/2 h-64 md:h-full bg-black relative border-r border-[#E0E7D1]/10">
                {selectedMemory.imageStorageId ? (
                  <img 
                    src={`${window.location.origin}/api/storage/${selectedMemory.imageStorageId}`} 
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-20 h-20 text-[#E0E7D1]/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-[#E0E7D1] drop-shadow-lg leading-none mb-2">
                    {selectedMemory.title}
                  </h2>
                  <p className="text-[#E0E7D1]/60 font-mono text-xs tracking-widest">
                    {new Date(selectedMemory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col bg-[#0a0a0a]">
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                  <p className="text-lg text-[#E0E7D1]/80 leading-loose font-light whitespace-pre-wrap">
                    {selectedMemory.story}
                  </p>
                </div>
                <div className="p-6 border-t border-[#E0E7D1]/10 bg-[#0f0f0f] flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    onClick={async () => {
                      if (confirm("Delete this memory?")) {
                        await deleteMemory({ id: selectedMemory._id });
                        setSelectedMemory(null);
                        toast.success("Memory deleted.");
                      }
                    }}
                    className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 uppercase tracking-wider font-bold text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedMemory(null)}
                    className="border-[#E0E7D1]/20 text-[#E0E7D1] hover:bg-[#E0E7D1] hover:text-black uppercase tracking-wider font-bold"
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