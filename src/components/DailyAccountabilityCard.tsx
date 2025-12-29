import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, ListTodo, TrendingUp, Phone, Plus, X, DollarSign, Trash2, Target, Zap, AlertTriangle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyAccountabilityCardProps {
  dateStr: string;
  initialData?: {
    productivityInventory?: { text: string; checked: boolean }[];
    improvements?: string[];
    callsBooked?: number;
    callsConducted?: number;
    callsClosed?: number;
    distractions?: string[];
    focusScore?: number;
    outputLog?: string;
    dailyRating?: number;
    outputScore?: number;
    workType?: string;
    targetHours?: number;
  } | null;
}

export default function DailyAccountabilityCard({ dateStr, initialData }: DailyAccountabilityCardProps) {
  const updateMetrics = useMutation(api.history.updateDailyMetrics);
  
  const [inventory, setInventory] = useState<{ text: string; checked: boolean }[]>([
    { text: "", checked: false },
    { text: "", checked: false },
    { text: "", checked: false }
  ]);
  const [improvements, setImprovements] = useState<string[]>(["", "", ""]);
  const [callsBooked, setCallsBooked] = useState(0);
  const [callsConducted, setCallsConducted] = useState(0);
  const [callsClosed, setCallsClosed] = useState(0);
  const [distractions, setDistractions] = useState<string[]>([]);
  const [newDistraction, setNewDistraction] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.productivityInventory && initialData.productivityInventory.length > 0) {
        setInventory(initialData.productivityInventory);
      } else {
        setInventory([
          { text: "", checked: false },
          { text: "", checked: false },
          { text: "", checked: false }
        ]);
      }
      
      if (initialData.improvements && initialData.improvements.length > 0) {
        setImprovements(initialData.improvements);
      } else {
        setImprovements(["", "", ""]);
      }

      setCallsBooked(initialData.callsBooked || 0);
      setCallsConducted(initialData.callsConducted || 0);
      setCallsClosed(initialData.callsClosed || 0);
      setDistractions(initialData.distractions || []);
    } else {
      // Reset if no data
      setInventory([
        { text: "", checked: false },
        { text: "", checked: false },
        { text: "", checked: false }
      ]);
      setImprovements(["", "", ""]);
      setCallsBooked(0);
      setCallsConducted(0);
      setCallsClosed(0);
      setDistractions([]);
    }
    setIsDirty(false);
  }, [initialData, dateStr]);

  const handleSave = async () => {
    try {
      await updateMetrics({
        date: dateStr,
        focusScore: initialData?.focusScore || 5,
        outputLog: initialData?.outputLog || "",
        dailyRating: initialData?.dailyRating || 50,
        outputScore: initialData?.outputScore,
        workType: initialData?.workType,
        targetHours: initialData?.targetHours,
        
        productivityInventory: inventory,
        improvements: improvements,
        callsBooked,
        callsConducted,
        callsClosed,
        distractions,
      });
      toast.success("Accountability saved");
      setIsDirty(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save accountability");
    }
  };

  const updateInventory = (index: number, field: 'text' | 'checked', value: any) => {
    const newInv = [...inventory];
    newInv[index] = { ...newInv[index], [field]: value };
    setInventory(newInv);
    setIsDirty(true);
  };

  const addInventoryItem = () => {
    setInventory([...inventory, { text: "", checked: false }]);
    setIsDirty(true);
  };

  const removeInventoryItem = (index: number) => {
    const newInv = [...inventory];
    newInv.splice(index, 1);
    setInventory(newInv);
    setIsDirty(true);
  };

  const updateImprovement = (index: number, value: string) => {
    const newImp = [...improvements];
    newImp[index] = value;
    setImprovements(newImp);
    setIsDirty(true);
  };

  const addImprovementItem = () => {
    setImprovements([...improvements, ""]);
    setIsDirty(true);
  };

  const removeImprovementItem = (index: number) => {
    const newImp = [...improvements];
    newImp.splice(index, 1);
    setImprovements(newImp);
    setIsDirty(true);
  };

  const addDistraction = () => {
    if (newDistraction.trim()) {
      setDistractions([...distractions, newDistraction.trim()]);
      setNewDistraction("");
      setIsDirty(true);
    }
  };

  const removeDistraction = (index: number) => {
    const newDist = [...distractions];
    newDist.splice(index, 1);
    setDistractions(newDist);
    setIsDirty(true);
  };

  const getInventoryPlaceholder = (index: number) => {
    if (index === 0) return "e.g. Recorded 4 short-form videos";
    if (index === 1) return "e.g. Sent 12 outbound DMs";
    return `Action that moved the needle ${index + 1}...`;
  };

  const getImprovementPlaceholder = (index: number) => {
    if (index === 0) return "e.g. Plan tomorrow the night before";
    if (index === 1) return "e.g. Start deep work before checking messages";
    return `Improvement ${index + 1}...`;
  };

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-background/50 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <CardHeader className="pb-6 border-b border-border/50 bg-muted/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
              <Target className="h-5 w-5 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
                Daily Accountability
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              NO EXCUSES • TOTAL OWNERSHIP • RELENTLESS EXECUTION
            </p>
          </div>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button 
                size="sm" 
                onClick={handleSave} 
                className="h-9 px-4 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                SAVE CHANGES
              </Button>
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border/50">
          
          {/* Section 1: Productivity Inventory */}
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
                      onCheckedChange={(c) => updateInventory(i, 'checked', c)}
                      className="w-5 h-5 border-2 border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-all duration-300"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      value={item.text}
                      onChange={(e) => updateInventory(i, 'text', e.target.value)}
                      placeholder={getInventoryPlaceholder(i)}
                      className={`h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 ${item.checked ? 'text-muted-foreground line-through decoration-primary/50' : ''}`}
                    />
                    {item.text && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeInventoryItem(i)}
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
                onClick={addInventoryItem}
                className="w-full border border-dashed border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 h-9"
              >
                <Plus className="h-3 w-3 mr-2" /> Add Proof Item
              </Button>
              <p className="text-xs text-muted-foreground/70 italic text-center pt-1">
                "If you can't fill at least 1 box, the day was weak — no excuses."
              </p>
            </div>
          </div>

          {/* Section 2: Improvements */}
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
                      onChange={(e) => updateImprovement(i, e.target.value)}
                      placeholder={getImprovementPlaceholder(i)}
                      className="h-10 pl-9 bg-background/50 border-muted-foreground/20 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
                    />
                    {imp && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeImprovementItem(i)}
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
                onClick={addImprovementItem}
                className="w-full border border-dashed border-muted-foreground/20 text-muted-foreground hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 h-9"
              >
                <Plus className="h-3 w-3 mr-2" /> Add Improvement
              </Button>
            </div>
          </div>

          {/* Split Section: Sales & Distractions */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            
            {/* Section 3: Sales */}
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
                        value={callsBooked}
                        onChange={(e) => {
                          setCallsBooked(parseInt(e.target.value) || 0);
                          setIsDirty(true);
                        }}
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
                        value={callsConducted}
                        onChange={(e) => {
                          setCallsConducted(parseInt(e.target.value) || 0);
                          setIsDirty(true);
                        }}
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
                        value={callsClosed}
                        onChange={(e) => {
                          setCallsClosed(parseInt(e.target.value) || 0);
                          setIsDirty(true);
                        }}
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

            {/* Section 4: Distractions */}
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
                      onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
                      placeholder="Identify the enemy..."
                      className="h-9 pl-9 bg-background/50 border-muted-foreground/20 focus:border-red-500/50 focus:ring-red-500/20"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={addDistraction} className="h-9 w-9 p-0 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/20">
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
                        <button onClick={() => removeDistraction(i)} className="hover:text-red-900 dark:hover:text-red-100 transition-colors">
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

          </div>
        </div>
      </CardContent>
    </Card>
  );
}