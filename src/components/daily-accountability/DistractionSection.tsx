import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Plus, X } from "lucide-react";
import { useState } from "react";

interface DistractionSectionProps {
  distractions: string[];
  onAdd: (distraction: string) => void;
  onRemove: (index: number) => void;
}

export function DistractionSection({ distractions, onAdd, onRemove }: DistractionSectionProps) {
  const [newDistraction, setNewDistraction] = useState("");

  const handleAdd = () => {
    const trimmed = newDistraction.trim();
    if (trimmed) {
      onAdd(trimmed);
      setNewDistraction("");
    }
  };

  return (
    <div className="p-6 space-y-4 bg-gradient-to-bl from-transparent via-red-500/5 to-transparent">
      <div className="flex items-center justify-between mb-2">
        <label className="text-base font-bold flex items-center gap-3 text-foreground">
          <div className="bg-red-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-md shadow-red-500/20">4</div>
          Distractions
        </label>
      </div>
      
      <div className="pl-11 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/50" />
            <Input 
              value={newDistraction}
              onChange={(e) => setNewDistraction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Identify the enemy..."
              className="h-9 pl-9 bg-background/50 border-muted-foreground/20 focus:border-red-500/50 focus:ring-red-500/20"
            />
          </div>
          <Button size="sm" variant="outline" onClick={handleAdd} className="h-9 w-9 p-0 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/20">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[40px] content-start">
          <AnimatePresence>
            {distractions.map((d, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-2 border border-red-200 dark:border-red-800 shadow-sm"
              >
                {d}
                <button onClick={() => onRemove(i)} className="hover:text-red-900 dark:hover:text-red-100 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {distractions.length === 0 && (
            <span className="text-xs text-muted-foreground/50 italic py-1">No distractions logged yet. Stay sharp.</span>
          )}
        </div>
      </div>
    </div>
  );
}
