import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { MoodboardGrid } from "./sba/MoodboardGrid";

export function SBAWorksheetView() {
  const memories = useQuery(api.sba.getMemories) || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-100 overflow-hidden relative">
      {/* Background Effects - Red/Orange Gradient Light Leak */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-gradient-to-t from-red-900/20 via-orange-900/10 to-transparent blur-[100px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Top Title Block (Reference Style) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 space-y-0"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#E0E0E0] leading-[0.85]">
            SBA
          </h1>
          <h2 className="text-3xl md:text-5xl font-black tracking-widest text-[#E0E0E0] uppercase">
            Worksheet
          </h2>
          
          <div className="mt-12 flex flex-col items-center gap-2 opacity-80">
             <div className="flex items-center gap-2 text-white/80">
                <span className="text-xs font-bold tracking-[0.3em] uppercase">Discipline OS</span>
                <Rocket className="w-4 h-4 -rotate-45 text-red-500" />
             </div>
          </div>
        </motion.div>

        {/* Story Thus Far Section */}
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-wide text-[#E0E0E0] uppercase">
              Story Thus Far
            </h3>
            <p className="text-[10px] md:text-xs font-bold tracking-widest text-gray-500 uppercase max-w-md mx-auto">
              Add photos showing snippets of your life all the way from your childhood to now
            </p>
          </div>

          {/* Moodboard Grid (Visuals + Story) */}
          <MoodboardGrid memories={memories} />
        </div>

      </div>
    </div>
  );
}