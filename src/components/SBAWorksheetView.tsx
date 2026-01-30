import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image as ImageIcon, Calendar, BookOpen, Sparkles, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

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
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 font-sans selection:bg-red-900/30">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex flex-col items-center justify-center overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0a0a] to-[#0a0a0a] z-0" />
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="z-10 text-center space-y-6"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#e5e5e5] to-[#555] uppercase select-none">
            SBA
          </h1>
          <div className="h-px w-32 bg-red-600 mx-auto" />
          <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-[#888]">
            Worksheet
          </h2>
          <p className="text-sm md:text-base text-[#555] tracking-widest uppercase mt-4">
            See • Believe • Achieve
          </p>
        </motion.div>
      </div>

      {/* Story Thus Far Section */}
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-[#e5e5e5]"
          >
            The Story Thus Far
          </motion.h3>
          <p className="text-[#666] max-w-xl text-sm md:text-base uppercase tracking-widest leading-relaxed">
            Add photos showing snippets of your life all the way from your childhood to now.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {sortedMemories.map((memory, index) => (
              <motion.div
                key={memory._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMemory(memory)}
                className="group cursor-pointer relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#111] border border-[#222] hover:border-red-900/50 transition-all duration-500"
              >
                {memory.imageStorageId ? (
                  <img 
                    src={`${window.location.origin}/api/storage/${memory.imageStorageId}`} 
                    alt={memory.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#151515]">
                    <ImageIcon className="w-12 h-12 text-[#333]" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-red-500 text-xs font-bold tracking-widest uppercase">
                    {new Date(memory.date).getFullYear()}
                  </p>
                  <h4 className="text-2xl font-bold text-white uppercase tracking-tight leading-none">
                    {memory.title}
                  </h4>
                  <div className="h-0.5 w-0 group-hover:w-12 bg-red-600 transition-all duration-500 delay-100" />
                </div>
              </motion.div>
            ))}
            
            {/* Add New Card */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => setIsAddOpen(true)}
              className="aspect-[4/5] rounded-2xl border-2 border-dashed border-[#222] hover:border-red-900/30 bg-[#0a0a0a] hover:bg-[#111] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#151515] group-hover:bg-red-900/10 flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-[#333] group-hover:text-red-500 transition-colors" />
              </div>
              <p className="text-[#444] group-hover:text-[#666] font-medium uppercase tracking-widest text-sm">
                Add Memory
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-[#e5e5e5] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">Enshrine a Memory</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#666] uppercase text-xs tracking-widest">Title</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#111] border-[#222] focus:border-red-900/50 text-lg font-bold"
                  placeholder="THE BEGINNING"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#666] uppercase text-xs tracking-widest">Date</Label>
                <Input 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#111] border-[#222] focus:border-red-900/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#666] uppercase text-xs tracking-widest">Visual Evidence</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border border-dashed border-[#333] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#111] transition-colors"
              >
                {selectedImage ? (
                  <div className="text-center">
                    <p className="text-red-500 font-medium">{selectedImage.name}</p>
                    <p className="text-xs text-[#555]">Click to change</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#444] mb-2" />
                    <p className="text-[#444] text-sm">Upload Photo</p>
                  </>
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

            <div className="space-y-2">
              <Label className="text-[#666] uppercase text-xs tracking-widest">The Deep Story</Label>
              <Textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="bg-[#111] border-[#222] focus:border-red-900/50 min-h-[150px] leading-relaxed"
                placeholder="Write the story deeply..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsAddOpen(false)}
              className="text-[#666] hover:text-[#e5e5e5] hover:bg-transparent"
            >
              CANCEL
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-red-900 hover:bg-red-800 text-white px-8"
            >
              {isSubmitting ? "SAVING..." : "IMMORTALIZE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Memory Dialog */}
      <Dialog open={!!selectedMemory} onOpenChange={(open) => !open && setSelectedMemory(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-[#e5e5e5] max-w-4xl p-0 overflow-hidden h-[80vh] flex flex-col md:flex-row">
          {selectedMemory && (
            <>
              <div className="w-full md:w-1/2 h-64 md:h-full relative bg-[#050505]">
                {selectedMemory.imageStorageId ? (
                  <img 
                    src={`${window.location.origin}/api/storage/${selectedMemory.imageStorageId}`} 
                    alt={selectedMemory.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-[#222]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-red-500 font-bold tracking-widest uppercase text-sm">
                      {new Date(selectedMemory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                      {selectedMemory.title}
                    </h2>
                    <div className="h-1 w-20 bg-red-600" />
                  </div>
                  
                  <div className="prose prose-invert prose-lg">
                    <p className="text-[#888] leading-relaxed whitespace-pre-wrap font-light">
                      {selectedMemory.story}
                    </p>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-red-900 hover:text-red-500 hover:bg-transparent p-0 h-auto text-xs uppercase tracking-widest"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this memory?")) {
                          await deleteMemory({ id: selectedMemory._id });
                          setSelectedMemory(null);
                          toast.success("Memory removed.");
                        }
                      }}
                    >
                      Delete Memory
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
