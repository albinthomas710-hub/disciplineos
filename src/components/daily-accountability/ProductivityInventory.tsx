import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Trash2, Plus } from "lucide-react";

interface InventoryItem {
  text: string;
  checked: boolean;
}

interface ProductivityInventoryProps {
  inventory: InventoryItem[];
  onUpdate: (index: number, field: 'text' | 'checked', value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ProductivityInventory({ inventory, onUpdate, onAdd, onRemove }: ProductivityInventoryProps) {
  const getPlaceholder = (index: number) => {
    if (index === 0) return "e.g. Recorded 4 short-form videos";
    if (index === 1) return "e.g. Sent 12 outbound DMs";
    return `Action that moved the needle ${index + 1}...`;
  };

  return (
    <div className="p-6 space-y-4 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-base font-bold flex items-center gap-3 text-foreground">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-md shadow-primary/20">1</div>
            Productivity Inventory
          </label>
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            Proof List
          </span>
        </div>
        <p className="text-sm text-muted-foreground pl-11 leading-relaxed">
          <span className="text-primary font-semibold">The Rule:</span> This is not a to-do list. It's a <span className="italic font-medium text-foreground">proof list</span>. What specific actions today directly moved your main goal forward?
        </p>
      </div>
      
      <div className="space-y-3 pl-11">
        {inventory.map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 group relative"
          >
            <div className="relative flex items-center justify-center">
              <Checkbox 
                checked={item.checked} 
                onCheckedChange={(c) => onUpdate(i, 'checked', c)}
                className="w-5 h-5 border-2 border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-all duration-300"
              />
            </div>
            <div className="relative flex-1">
              <Input 
                value={item.text}
                onChange={(e) => onUpdate(i, 'text', e.target.value)}
                placeholder={getPlaceholder(i)}
                className={`h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 ${item.checked ? 'text-muted-foreground line-through decoration-primary/50' : ''}`}
              />
              {item.text && (
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
          className="w-full border border-dashed border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 h-9"
        >
          <Plus className="h-3 w-3 mr-2" /> Add Proof Item
        </Button>
        <p className="text-xs text-muted-foreground/70 italic text-center pt-1">
          "If you can't fill at least 1 box, the day was weak — no excuses."
        </p>
      </div>
    </div>
  );
}
