import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Trash2, Plus, BrainCircuit } from "lucide-react";

interface ImprovementSectionProps {
  improvements: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ImprovementSection({ improvements, onUpdate, onAdd, onRemove }: ImprovementSectionProps) {
  const getPlaceholder = (index: number) => {
    if (index === 0) return "e.g. Plan tomorrow the night before";
    if (index === 1) return "e.g. Start deep work before checking messages";
    return `Improvement ${index + 1}...`;
  };

  return (
    <div className="p-6 space-y-4 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-base font-bold flex items-center gap-3 text-foreground">
            <div className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-md shadow-blue-500/20">2</div>
            How could I improve?
          </label>
          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
            Process Optimization
          </span>
        </div>
        <p className="text-sm text-muted-foreground pl-11 leading-relaxed">
          <span className="text-blue-500 font-semibold">The Question:</span> What <span className="italic font-medium text-foreground">ONE thing</span> would have made today better if fixed?
        </p>
      </div>
      
      <div className="space-y-3 pl-11">
        {improvements.map((imp, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 group"
          >
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <Input 
                value={imp}
                onChange={(e) => onUpdate(i, e.target.value)}
                placeholder={getPlaceholder(i)}
                className="h-10 pl-9 bg-background/50 border-muted-foreground/20 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
              />
              {imp && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAdd}
          className="w-full border border-dashed border-muted-foreground/20 text-muted-foreground hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 h-9"
        >
          <Plus className="h-3 w-3 mr-2" /> Add Improvement
        </Button>
      </div>
    </div>
  );
}
