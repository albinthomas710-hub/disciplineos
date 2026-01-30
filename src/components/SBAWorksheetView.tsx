import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { MoodboardGrid } from "./sba/MoodboardGrid";
import { NarrativeList } from "./sba/NarrativeList";

export function SBAWorksheetView() {
  const memories = useQuery(api.sba.getMemories) || [];

  return (
    <div className="min-h-screen bg-[#0b0d14] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d14] via-[#0f1219] to-[#0b0d14]" />
        
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

        {/* Moodboard Grid (Visuals) */}
        <MoodboardGrid memories={memories} />

        {/* Narrative List (Text) */}
        <NarrativeList memories={memories} />

      </div>
    </div>
  );
}