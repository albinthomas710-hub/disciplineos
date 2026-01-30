import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, Loader2, Upload, Sparkles, Trash2, Edit2, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";

interface MoodboardGridProps {
  memories: any[];
}

export function MoodboardGrid({ memories }: MoodboardGridProps) {
  const navigate = useNavigate();
  const createMemory = useMutation(api.sba.createMemory);
  const updateMemory = useMutation(api.sba.updateMemory);
  const deleteMemory = useMutation(api.sba.deleteMemory);
  const generateUploadUrl = useMutation(api.sba.generateUploadUrl);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort memories by date
  const sortedMemories = memories?.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  
  // Grid generation: 9 slots
  const gridSlots = Array.from({ length: 9 }, (_, i) => sortedMemories[i] || null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      const { storageId } = await result.json();

      await createMemory({
        title: "UNTITLED MEMORY",
        story: "",
        date: new Date().toISOString().split("T")[0],
        imageStorageId: storageId,
      });

      toast.success("Evidence enshrined.");
      setIsUploadOpen(false);
      setSelectedImage(null);
    } catch (e) {
      toast.error("Failed to upload evidence.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"sbaMemories">) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      try {
        await deleteMemory({ id });
        toast.success("Memory deleted.");
      } catch (e) {
        toast.error("Failed to delete.");
      }
    }
  };

  const openEditor = (memory: any) => {
    navigate(`/memory/${memory._id}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mb-16">
        {gridSlots.map((memory, index) => (
          <motion.div
            key={memory?._id || index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="relative aspect-[4/5] group flex flex-col gap-3"
          >
            {/* Image Container */}
            <div 
              onClick={() => !memory && setIsUploadOpen(true)}
              className={cn(
                "w-full flex-1 rounded-xl relative overflow-hidden transition-all duration-500",
                "bg-[#0f1219] border border-white/5",
                memory ? "cursor-default" : "cursor-pointer hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]"
              )}
            >
              {/* Gradient Top Line */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r z-10",
                memory ? "from-cyan-500 via-purple-500 to-cyan-500" : "from-transparent via-white/5 to-transparent group-hover:via-cyan-500/50"
              )} />

              {memory ? (
                <div className="w-full h-full relative group/image">
                  {(memory.displayUrl || memory.imageUrl) ? (
                    <img 
                      src={memory.displayUrl || memory.imageUrl} 
                      alt={memory.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <ImageIcon className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  
                  {/* Delete Button - Always visible on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(memory._id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white/70 hover:text-red-400 hover:bg-black/80 transition-all opacity-0 group-hover/image:opacity-100 z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 group-hover:gap-3 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-300">
                    <Plus className="w-5 h-5 text-white/30 group-hover:text-cyan-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Title/Story Bar - Separate from image */}
            {memory && (
              <div 
                onClick={() => openEditor(memory)}
                className="h-14 bg-[#0f1219] border border-white/10 rounded-lg flex items-center justify-between px-4 cursor-pointer hover:border-purple-500/30 hover:bg-white/5 transition-all group/bar"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-wider truncate">
                    {memory.title || "Untitled"}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono truncate">
                    {memory.date}
                  </span>
                </div>
                <Edit2 className="w-3 h-3 text-gray-600 group-hover/bar:text-purple-400 transition-colors" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-[#0f1219]/95 backdrop-blur-2xl border-white/10 text-white max-w-md p-0 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.7)]">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
          
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  UPLOAD EVIDENCE
                </span>
              </DialogTitle>
            </DialogHeader>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden bg-black/20"
            >
              {selectedImage ? (
                <div className="text-center z-10 relative w-full h-full flex flex-col items-center justify-center">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 z-20">
                    <p className="text-cyan-400 font-bold flex items-center gap-2 text-sm">
                      <Sparkles className="w-3 h-3" />
                      {selectedImage.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/50 mt-2 font-mono z-20 uppercase tracking-wider">Click to replace</p>
                </div>
              ) : (
                <div className="text-center space-y-4 z-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-white/10 group-hover:border-cyan-500/30">
                    <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold text-sm group-hover:text-white transition-colors uppercase tracking-wider">Select Image</p>
                    <p className="text-[10px] text-gray-600 mt-1">JPG, PNG, WEBP</p>
                  </div>
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

            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsUploadOpen(false)}
                className="text-gray-500 hover:text-white hover:bg-white/5 uppercase tracking-wider font-bold text-[10px]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedImage || isSubmitting}
                className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 hover:text-cyan-300 border border-cyan-500/30 rounded-lg px-6 font-bold tracking-wider uppercase text-[10px]"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enshrine"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}