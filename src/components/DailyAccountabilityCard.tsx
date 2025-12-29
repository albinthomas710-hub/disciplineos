import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, ListTodo, TrendingUp, Phone, Plus, X } from "lucide-react";

interface DailyAccountabilityCardProps {
  dateStr: string;
  initialData?: {
    productivityInventory?: { text: string; checked: boolean }[];
    improvements?: string[];
    callsBooked?: number;
    callsConducted?: number;
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
  const [distractions, setDistractions] = useState<string[]>([]);
  const [newDistraction, setNewDistraction] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.productivityInventory && initialData.productivityInventory.length > 0) {
        const loaded = [...initialData.productivityInventory];
        while (loaded.length < 3) loaded.push({ text: "", checked: false });
        setInventory(loaded);
      } else {
        setInventory([
          { text: "", checked: false },
          { text: "", checked: false },
          { text: "", checked: false }
        ]);
      }
      
      if (initialData.improvements && initialData.improvements.length > 0) {
        const loaded = [...initialData.improvements];
        while (loaded.length < 3) loaded.push("");
        setImprovements(loaded);
      } else {
        setImprovements(["", "", ""]);
      }

      setCallsBooked(initialData.callsBooked || 0);
      setCallsConducted(initialData.callsConducted || 0);
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

  const updateImprovement = (index: number, value: string) => {
    const newImp = [...improvements];
    newImp[index] = value;
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

  return (
    <Card className="border-2 border-muted/50 overflow-hidden">
      <CardHeader className="bg-muted/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Daily Accountability
          </CardTitle>
          {isDirty && (
            <Button size="sm" onClick={handleSave} className="h-8">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Productivity Inventory
            </label>
            <span className="text-xs text-muted-foreground">Proof List (Not To-Do)</span>
          </div>
          <div className="space-y-2 pl-8">
            {inventory.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <Checkbox 
                  checked={item.checked} 
                  onCheckedChange={(c) => updateInventory(i, 'checked', c)}
                />
                <Input 
                  value={item.text}
                  onChange={(e) => updateInventory(i, 'text', e.target.value)}
                  placeholder={`Action that moved the needle ${i + 1}...`}
                  className="h-8 text-sm"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground italic">
              "If you can't fill at least 1 box, the day was weak — no excuses."
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              How could I improve?
            </label>
            <span className="text-xs text-muted-foreground">Process Improvement</span>
          </div>
          <div className="space-y-2 pl-8">
            {improvements.map((imp, i) => (
              <Input 
                key={i}
                value={imp}
                onChange={(e) => updateImprovement(i, e.target.value)}
                placeholder={`Improvement ${i + 1} (e.g. Start deep work earlier)`}
                className="h-8 text-sm"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Sales Accountability
            </label>
            <div className="pl-8 space-y-4">
              <div className="flex items-center gap-4 bg-secondary/20 p-3 rounded-lg border border-secondary/50">
                <div className="flex-1 text-center">
                  <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">Booked</span>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <Input 
                      type="number" 
                      min={0}
                      value={callsBooked}
                      onChange={(e) => {
                        setCallsBooked(parseInt(e.target.value) || 0);
                        setIsDirty(true);
                      }}
                      className="w-16 h-8 text-center font-bold"
                    />
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex-1 text-center">
                  <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">Conducted</span>
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <Input 
                      type="number" 
                      min={0}
                      value={callsConducted}
                      onChange={(e) => {
                        setCallsConducted(parseInt(e.target.value) || 0);
                        setIsDirty(true);
                      }}
                      className="w-16 h-8 text-center font-bold"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                "Booked ≠ done. Ties effort to revenue."
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              Distractions
            </label>
            <div className="pl-8 space-y-2">
              <div className="flex gap-2">
                <Input 
                  value={newDistraction}
                  onChange={(e) => setNewDistraction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
                  placeholder="Add distraction (e.g. YouTube)"
                  className="h-8 text-sm"
                />
                <Button size="sm" variant="outline" onClick={addDistraction} className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {distractions.map((d, i) => (
                  <div key={i} className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-red-200 dark:border-red-800">
                    {d}
                    <button onClick={() => removeDistraction(i)} className="hover:text-red-900 dark:hover:text-red-100">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {distractions.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No distractions logged.</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}