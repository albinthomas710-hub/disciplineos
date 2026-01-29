import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Target, Shield, AlertTriangle, Crosshair, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from "date-fns";
import { toast } from "sonner";

interface StrategicWarMapViewProps {
  year: number;
}

export default function StrategicWarMapView({ year }: StrategicWarMapViewProps) {
  const quarterlyPlans = useQuery(api.quarterlyPlans.getYearlyQuarterlyPlans, { year });
  const yearlyData = useQuery(api.history.getYearlyStats, { year });

  const quarters = [1, 2, 3, 4];

  return (
    <div className="space-y-8">
      {quarters.map((quarter) => (
        <QuarterSection 
          key={quarter} 
          year={year} 
          quarter={quarter} 
          plan={quarterlyPlans?.find(p => p.quarter === quarter)}
          yearlyData={yearlyData}
        />
      ))}
    </div>
  );
}

function QuarterSection({ year, quarter, plan, yearlyData }: { year: number, quarter: number, plan: any, yearlyData: any }) {
  const upsertPlan = useMutation(api.quarterlyPlans.upsertQuarterlyPlan);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    objective: plan?.objective || "",
    metricTarget: plan?.metricTarget || "",
    primaryFocus: plan?.primaryFocus || "",
    initiatives: plan?.initiatives || ["", "", ""],
    constraints: plan?.constraints || "",
    nonNegotiables: plan?.nonNegotiables || "",
  });

  const handleSave = async () => {
    try {
      await upsertPlan({
        year,
        quarter,
        objective: formData.objective,
        metricTarget: formData.metricTarget,
        primaryFocus: formData.primaryFocus,
        initiatives: formData.initiatives.filter(i => i.trim() !== ""),
        constraints: formData.constraints,
        nonNegotiables: formData.nonNegotiables,
      });
      setIsEditing(false);
      toast.success("Quarterly plan saved");
    } catch (error) {
      toast.error("Failed to save plan");
    }
  };

  const getMonthsInQuarter = (q: number) => {
    const startMonth = (q - 1) * 3;
    return [startMonth, startMonth + 1, startMonth + 2];
  };

  const months = getMonthsInQuarter(quarter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b pb-8 last:border-0">
      {/* Quarterly Control Block (Left Side) */}
      <div className="lg:col-span-3">
        <Card className="h-full border-2 border-primary/10 bg-card/50">
          <CardHeader className="pb-2 bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Q{quarter}</CardTitle>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setFormData({
                      objective: plan?.objective || "",
                      metricTarget: plan?.metricTarget || "",
                      primaryFocus: plan?.primaryFocus || "",
                      initiatives: plan?.initiatives?.length ? plan.initiatives : ["", "", ""],
                      constraints: plan?.constraints || "",
                      nonNegotiables: plan?.nonNegotiables || "",
                    });
                  }}>
                    {plan ? "Edit" : "Plan"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Plan Quarter {quarter} - {year}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Quarter Objective (One Sentence)</Label>
                      <Input 
                        value={formData.objective} 
                        onChange={(e) => setFormData({...formData, objective: e.target.value})}
                        placeholder="e.g., Launch MVP and get 100 users"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hard Metric Target</Label>
                        <Input 
                          value={formData.metricTarget} 
                          onChange={(e) => setFormData({...formData, metricTarget: e.target.value})}
                          placeholder="e.g., $10k MRR"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Focus (One Bet)</Label>
                        <Input 
                          value={formData.primaryFocus} 
                          onChange={(e) => setFormData({...formData, primaryFocus: e.target.value})}
                          placeholder="e.g., Viral Marketing"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Key Initiatives (Max 3)</Label>
                      {formData.initiatives.map((init, idx) => (
                        <Input 
                          key={idx}
                          value={init}
                          onChange={(e) => {
                            const newInit = [...formData.initiatives];
                            newInit[idx] = e.target.value;
                            setFormData({...formData, initiatives: newInit});
                          }}
                          placeholder={`Initiative ${idx + 1}`}
                          className="mb-2"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Constraints / Risks</Label>
                      <Textarea 
                        value={formData.constraints} 
                        onChange={(e) => setFormData({...formData, constraints: e.target.value})}
                        placeholder="What can break this quarter?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Non-Negotiables</Label>
                      <Input 
                        value={formData.nonNegotiables} 
                        onChange={(e) => setFormData({...formData, nonNegotiables: e.target.value})}
                        placeholder="Rules that must be followed"
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Quarterly Plan</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {plan ? (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Objective</p>
                  <p className="font-medium leading-tight">{plan.objective}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/50 p-2 rounded">
                    <p className="text-[10px] text-muted-foreground uppercase">Target</p>
                    <p className="font-bold text-sm">{plan.metricTarget}</p>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded">
                    <p className="text-[10px] text-muted-foreground uppercase">Focus</p>
                    <p className="font-bold text-sm">{plan.primaryFocus}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Initiatives</p>
                  <ul className="space-y-1">
                    {plan.initiatives.map((init: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {init}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-red-500">Constraints</p>
                  <p className="text-xs text-muted-foreground">{plan.constraints}</p>
                </div>
                {plan.nonNegotiables && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-amber-500">Non-Negotiables</p>
                    <p className="text-xs text-muted-foreground">{plan.nonNegotiables}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                <Target className="h-8 w-8 mb-2 opacity-20" />
                <p>No Plan Set</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Columns (Right Side) */}
      <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
        {months.map((monthIndex) => (
          <MonthColumn 
            key={monthIndex} 
            year={year} 
            monthIndex={monthIndex} 
            yearlyData={yearlyData}
          />
        ))}
      </div>
    </div>
  );
}

function MonthColumn({ year, monthIndex, yearlyData }: { year: number, monthIndex: number, yearlyData: any }) {
  const date = new Date(year, monthIndex, 1);
  const monthName = format(date, "MMMM");
  const days = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
  const startDay = getDay(startOfMonth(date));

  const getDayStatus = (dateStr: string) => {
    const stats = yearlyData?.[dateStr];
    if (!stats) return { color: "bg-secondary/30" };
    
    if (stats.dailyRating !== undefined && stats.dailyRating > 0) {
      const rating = stats.dailyRating;
      if (rating >= 90) return { color: "bg-amber-500" };
      if (rating >= 80) return { color: "bg-green-500" };
      if (rating >= 60) return { color: "bg-blue-500" };
      if (rating >= 40) return { color: "bg-purple-500" };
      return { color: "bg-red-500" };
    }
    
    if (stats.total > 0) {
      const rate = stats.completed / stats.total;
      if (rate >= 0.8) return { color: "bg-green-500" };
      if (rate >= 0.5) return { color: "bg-blue-500" };
      return { color: "bg-red-500" };
    }
    
    return { color: "bg-secondary/30" };
  };

  return (
    <div className="space-y-2">
      <div className="bg-black text-white dark:bg-white dark:text-black py-1 px-3 text-center font-bold uppercase tracking-widest text-sm rounded-t-sm">
        {monthName}
      </div>
      <div className="bg-card border rounded-b-sm p-3 min-h-[200px]">
        {/* Mini Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
              {d}
            </div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const status = getDayStatus(dateStr);
            const isCurrent = isToday(day);
            
            return (
              <div 
                key={dateStr}
                className={`
                  aspect-square rounded-[1px] 
                  ${status.color}
                  ${isCurrent ? "ring-1 ring-primary ring-offset-1" : ""}
                `}
                title={format(day, "MMM do")}
              />
            );
          })}
        </div>

        {/* Monthly Stats Placeholder */}
        <div className="space-y-2 pt-2 border-t border-dashed">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Focus:</span>
            <span className="font-medium">Not Set</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Completion:</span>
            <span className="font-medium">--%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
