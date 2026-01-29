import { motion } from "framer-motion";
import { Quote, Sparkles, Star } from "lucide-react";

export default function YearlyVerseBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-xl shadow-2xl mb-8 group"
    >
      {/* Background Image with Parallax-like effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform transition-transform duration-1000 group-hover:scale-105"
        style={{ 
          backgroundImage: "url('https://harmless-tapir-303.convex.cloud/api/storage/a50a28b6-1f75-45cc-848e-afa20cde31ef')",
        }}
      />
      
      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent dark:from-black/90 dark:via-black/70 dark:to-black/30" />
      
      {/* Content */}
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-medium tracking-wider text-xs uppercase">
            <Star className="h-3 w-3 fill-current" />
            <span>Verse of the Year</span>
            <Star className="h-3 w-3 fill-current" />
          </div>
          
          <div className="relative">
            <Quote className="absolute -left-4 -top-4 h-8 w-8 text-amber-500/20 rotate-180" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight font-serif italic">
              "Those who are wise will shine like the brightness of the heavens, and those who lead many to righteousness, like the stars for ever and ever."
            </h1>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px w-12 bg-amber-500/50" />
            <span className="text-amber-200 font-semibold tracking-wide">Daniel 12:3</span>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="hidden md:flex flex-col items-center justify-center text-white/80">
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner">
            <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
          </div>
          <span className="text-[10px] mt-2 uppercase tracking-widest opacity-60">Eternity</span>
        </div>
      </div>
      
      {/* Bottom sheen */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />
    </motion.div>
  );
}
