import { Input } from "@/components/ui/input";
import { Phone, TrendingUp, DollarSign } from "lucide-react";

interface SalesMetricsProps {
  booked: number;
  conducted: number;
  closed: number;
  onUpdate: (field: 'booked' | 'conducted' | 'closed', value: number) => void;
}

export function SalesMetrics({ booked, conducted, closed, onUpdate }: SalesMetricsProps) {
  return (
    <div className="p-6 space-y-4 bg-gradient-to-br from-transparent via-emerald-500/5 to-transparent">
      <div className="flex items-center justify-between mb-2">
        <label className="text-base font-bold flex items-center gap-3 text-foreground">
          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-md shadow-emerald-500/20">3</div>
          Sales Metrics
        </label>
      </div>
      
      <div className="pl-11 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-3 rounded-xl bg-background border border-border/50 shadow-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-[10px] uppercase text-muted-foreground font-bold mb-2 tracking-wider">Booked</span>
            <div className="relative w-full">
              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-500" />
              <Input 
                type="number" 
                min={0}
                value={booked}
                onChange={(e) => onUpdate('booked', parseInt(e.target.value) || 0)}
                className="h-9 text-center font-bold pl-6 pr-2 border-transparent bg-secondary/30 focus:bg-background focus:border-blue-500/30"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-xl bg-background border border-border/50 shadow-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-[10px] uppercase text-muted-foreground font-bold mb-2 tracking-wider">Conducted</span>
            <div className="relative w-full">
              <TrendingUp className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-emerald-500" />
              <Input 
                type="number" 
                min={0}
                value={conducted}
                onChange={(e) => onUpdate('conducted', parseInt(e.target.value) || 0)}
                className="h-9 text-center font-bold pl-6 pr-2 border-transparent bg-secondary/30 focus:bg-background focus:border-emerald-500/30"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-xl bg-background border border-border/50 shadow-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-[10px] uppercase text-muted-foreground font-bold mb-2 tracking-wider">Closed</span>
            <div className="relative w-full">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-500" />
              <Input 
                type="number" 
                min={0}
                value={closed}
                onChange={(e) => onUpdate('closed', parseInt(e.target.value) || 0)}
                className="h-9 text-center font-bold pl-6 pr-2 border-transparent bg-secondary/30 focus:bg-background focus:border-amber-500/30"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center font-medium">
          "Booked ≠ done. Ties effort to revenue."
        </p>
      </div>
    </div>
  );
}
