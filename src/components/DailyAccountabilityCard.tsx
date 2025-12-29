import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Target } from "lucide-react";
import { ProductivityInventory } from "./daily-accountability/ProductivityInventory";
import { ImprovementSection } from "./daily-accountability/ImprovementSection";
import { SalesMetrics } from "./daily-accountability/SalesMetrics";
import { DistractionSection } from "./daily-accountability/DistractionSection";

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
  const [isDirty, setIsDirty] = useState(false);
  
  const prevDateRef = useRef(dateStr);

  useEffect(() => {
    const dateChanged = prevDateRef.current !== dateStr;
    
    if (dateChanged) {
      prevDateRef.current = dateStr;
      setIsDirty(false);
    }

    if (dateChanged || !isDirty) {
      if (initialData) {
        setInventory(initialData.productivityInventory?.length ? initialData.productivityInventory : [{ text: "", checked: false }, { text: "", checked: false }, { text: "", checked: false }]);
        setImprovements(initialData.improvements?.length ? initialData.improvements : ["", "", ""]);
        setCallsBooked(initialData.callsBooked || 0);
        setCallsConducted(initialData.callsConducted || 0);
        setCallsClosed(initialData.callsClosed || 0);
        setDistractions(initialData.distractions || []);
      } else {
        setInventory([{ text: "", checked: false }, { text: "", checked: false }, { text: "", checked: false }]);
        setImprovements(["", "", ""]);
        setCallsBooked(0);
        setCallsConducted(0);
        setCallsClosed(0);
        setDistractions([]);
      }
    }
  }, [initialData, dateStr]);

  const handleSave = async () => {
    try {
      await updateMetrics({
        date: dateStr,
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

  const handleSalesUpdate = (field: 'booked' | 'conducted' | 'closed', value: number) => {
    if (field === 'booked') setCallsBooked(value);
    if (field === 'conducted') setCallsConducted(value);
    if (field === 'closed') setCallsClosed(value);
    setIsDirty(true);
  };

  const addDistraction = (distraction: string) => {
    setDistractions(prev => [...prev, distraction]);
    setIsDirty(true);
  };

  const removeDistraction = (index: number) => {
    const newDist = [...distractions];
    newDist.splice(index, 1);
    setDistractions(newDist);
    setIsDirty(true);
  };

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-background/50 overflow-hidden relative">
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
          <div className="flex gap-2">
             <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={!isDirty}
                className={`h-9 px-4 font-bold shadow-lg transition-all ${isDirty ? 'shadow-primary/20 hover:shadow-primary/40 opacity-100' : 'opacity-50'}`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isDirty ? "SAVE CHANGES" : "SAVED"}
              </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border/50">
          <ProductivityInventory 
            inventory={inventory}
            onUpdate={updateInventory}
            onAdd={addInventoryItem}
            onRemove={removeInventoryItem}
          />

          <ImprovementSection 
            improvements={improvements}
            onUpdate={updateImprovement}
            onAdd={addImprovementItem}
            onRemove={removeImprovementItem}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            <SalesMetrics 
              booked={callsBooked}
              conducted={callsConducted}
              closed={callsClosed}
              onUpdate={handleSalesUpdate}
            />

            <DistractionSection 
              distractions={distractions}
              onAdd={addDistraction}
              onRemove={removeDistraction}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}