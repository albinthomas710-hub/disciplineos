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
          className="text-center mb-12 space-y-0"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#E0E0E0] leading-[0.85]">
            SBA
          </h1>
          <h2 className="text-2xl md:text-4xl font-black tracking-widest text-[#E0E0E0] uppercase">
            Worksheet
          </h2>
          
          <div className="mt-8 flex flex-col items-center gap-2 opacity-80">
             <div className="flex items-center gap-2 text-white/80">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">DIGITAL LAUNCHPAD</span>
                <Rocket className="w-3 h-3 -rotate-45 text-red-500" />
             </div>
          </div>
        </motion.div>

        {/* Story Thus Far Section */}
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-2xl font-black tracking-wide text-[#E0E0E0] uppercase">
              Story Thus Far
            </h3>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase max-w-md mx-auto">
              Add photos showing snippets of your life all the way from your childhood to now
            </p>
          </div>

          {/* Moodboard Grid (Visuals + Story) */}
          <MoodboardGrid memories={memories} />
        </div>

        {/* The Philosophy / Lesson Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 max-w-3xl mx-auto relative"
        >
          {/* Decorative Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-b from-red-900/5 via-orange-900/5 to-transparent blur-[100px] -z-10" />

          <div className="border-l-2 border-red-500/30 pl-8 md:pl-12 py-4 space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-red-500 tracking-[0.3em] uppercase flex items-center gap-3">
                <span className="w-8 h-[1px] bg-red-500/50" />
                The Philosophy
              </h3>
              <h2 className="text-3xl md:text-4xl font-black text-[#E0E0E0] tracking-tight uppercase leading-none">
                See. Believe. Achieve.
              </h2>
            </div>

            <div className="space-y-6 text-gray-400 leading-relaxed font-medium text-sm md:text-base max-w-2xl">
              <p>
                We often gaze so deeply into the future that we become blind to the mountains we've already climbed. We obsess over what we haven't done, forgetting the <span className="text-white font-bold">battles we've already won</span>.
              </p>
              <p>
                This archive is your <span className="text-red-400">proof of power</span>. It is the reminder that you are capable, strong, and victorious. When the future feels impossible, look here. You have started businesses, conquered demons, and survived 100% of your bad days.
              </p>
              <div className="pt-4">
                <p className="text-white/80 italic border-l-2 border-white/10 pl-4">
                  "See what you have done. Believe in who you are. Then you will have the strength to Achieve what comes next."
                </p>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-lg">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">The Trap</h4>
                <p className="text-xs text-gray-500">
                  Forgetting our achievements makes us feel weak and incapable when facing new challenges.
                </p>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-lg">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">The Truth</h4>
                <p className="text-xs text-gray-500">
                  You are already a conqueror. This story proves it. Use it as fuel for the next chapter.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}