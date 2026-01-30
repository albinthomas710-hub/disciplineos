import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, Loader2, Upload, Sparkles, Trash2, Edit2, Calendar, X, Rocket, PlusCircle } from "lucide-react";
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
  const [targetMemoryId, setTargetMemoryId] = useState<Id<"sbaMemories"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort memories by date
  const sortedMemories = memories?.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  
  // Dynamic grid: Use sortedMemories directly
  const gridSlots = sortedMemories;

  const handleAddBlock = async () => {
    try {
      await createMemory({
        title: "UNTITLED MEMORY",
        story: "",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "", // Empty image indicates placeholder
      });
      toast.success("New memory block added.");
    } catch (e) {
      toast.error("Failed to add block.");
    }
  };

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

    if (!targetMemoryId) {
        toast.error("No target memory selected.");
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

      await updateMemory({
        id: targetMemoryId,
        imageStorageId: storageId,
      });

      toast.success("Evidence enshrined.");
      setIsUploadOpen(false);
      setSelectedImage(null);
      setTargetMemoryId(null);
    } catch (e) {
      toast.error("Failed to upload evidence.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"sbaMemories">) => {
    if (confirm("Are you sure you want to delete this memory block?")) {
      try {
        await deleteMemory({ id });
        toast.success("Memory block deleted.");
      } catch (e) {
        toast.error("Failed to delete.");
      }
    }
  };

  const openEditor = (memory: any) => {
    navigate(`/memory/${memory._id}`);
  };

  const openUpload = (id: Id<"sbaMemories">) => {
    setTargetMemoryId(id);
    setIsUploadOpen(true);
  };

  return (
    <>
      {/* Increased max-width to make grid larger (zoomed in) */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-3xl mx-auto mb-12">
        {gridSlots.map((memory, index) => {
          // Check if this is a placeholder (no image)
          const hasImage = memory.displayUrl || memory.imageUrl;
          // Center logic applies if we have enough items, or just arbitrary index 4 for style
          const isCenter = index === 4; 
          
          return (
            <motion.div
              key={memory._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="relative aspect-square group flex flex-col"
            >
              {/* Image Container */}
              <div 
                onClick={() => !hasImage && openUpload(memory._id)}
                className={cn(
                  "w-full h-full rounded-2xl relative overflow-hidden transition-all duration-300",
                  "bg-[#0A0A0A] border border-white/10",
                  hasImage ? "cursor-default" : "cursor-pointer hover:border-white/30 hover:bg-[#111]"
                )}
              >
                {hasImage ? (
                  <div className="w-full h-full relative group/image">
                    <img 
                      src={memory.displayUrl || memory.imageUrl} 
                      alt={memory.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                    />
                    
                    {/* Delete Button - Always visible on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(memory._id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/70 hover:text-red-400 hover:bg-black/80 transition-all opacity-0 group-hover/image:opacity-100 z-20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Edit Overlay */}
                    <div 
                      onClick={() => openEditor(memory)}
                      className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-pointer z-10"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full relative group/placeholder">
                    {/* Delete Button for Placeholder */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(memory._id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/70 hover:text-red-400 hover:bg-black/80 transition-all opacity-0 group-hover/placeholder:opacity-100 z-20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {isCenter ? (
                      <div className="relative">
                         <Rocket className="w-12 h-12 text-[#E0E0E0] -rotate-45 fill-white/10" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest group-hover:text-[#666] transition-colors">
                        Picture
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Add Block Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleAddBlock}
          className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group"
        >
          <PlusCircle className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors mb-2" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/50">Add Block</span>
        </motion.button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md p-0 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-900 via-orange-800 to-red-900" />
          
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
                <Upload className="w-5 h-5 text-red-500" />
                <span className="text-[#E0E0E0]">
                  Upload Evidence
                </span>
              </DialogTitle>
            </DialogHeader>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-red-500/30 transition-all group relative overflow-hidden bg-black/20"
            >
              {selectedImage ? (
                <div className="text-center z-10 relative w-full h-full flex flex-col items-center justify-center">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 z-20">
                    <p className="text-red-400 font-bold flex items-center gap-2 text-sm">
                      <Sparkles className="w-3 h-3" />
                      {selectedImage.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/50 mt-2 font-mono z-20 uppercase tracking-wider">Click to replace</p>
                </div>
              ) : (
                <div className="text-center space-y-4 z-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-white/10 group-hover:border-red-500/30">
                    <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-red-400 transition-colors" />
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
                className="bg-red-600 text-white hover:bg-red-700 border border-red-500/30 rounded-lg px-6 font-bold tracking-wider uppercase text-[10px]"
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