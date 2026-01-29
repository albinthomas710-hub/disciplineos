import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Target, ShieldAlert, Calendar } from "lucide-react";
import { AddResolutionDialog } from "./resolutions/AddResolutionDialog";
import { ResolutionCard } from "./resolutions/ResolutionCard";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function ResolutionsView() {
  const resolutions = useQuery(api.resolutions.get);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Calculate date range for logs (current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];
  
  const logs = useQuery(api.resolutions.getLogs, { startDate: startOfMonth, endDate: endOfMonth });

  if (resolutions === undefined) {
    return <div className="p-8 text-center animate-pulse">Loading your destiny...</div>;
  }

  const buildResolutions = resolutions.filter(r => r.type === "build");
  const breakResolutions = resolutions.filter(r => r.type === "break");

  // Helper to get streak (simplified: just count consecutive success backwards from today)
  // In a real app, this would be more robust on backend
  const getStreak = (resolutionId: string) => {
    if (!logs) return 0;
    const resLogs = logs
      .filter(l => l.resolutionId === resolutionId && l.status === "success")
      .sort((a, b) => b.date.localeCompare(a.date)); // Descending date
    
    let streak = 0;
    // Logic: Check if today or yesterday has a log, then count backwards
    // This is a simple approximation for UI
    let checkDate = new Date();
    
    // If today is logged as success, start counting. If not, check yesterday.
    const todayLog = resLogs.find(l => l.date === today);
    if (!todayLog) {
       // If not logged today, check if logged yesterday to maintain streak
       checkDate.setDate(checkDate.getDate() - 1);
       const yestStr = checkDate.toISOString().split("T")[0];
       if (!resLogs.find(l => l.date === yestStr)) return 0;
    }

    // Simple count of logs for now as "total days" or implement real consecutive logic
    // For visual impact, let's just show total successes this month for now
    return resLogs.length; 
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            New Year Protocols
          </h2>
          <p className="text-muted-foreground mt-1">
            Design your character. Eliminate weakness.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)} 
          className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Resolution
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Build Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-blue-900">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">New Habits (No Excuses)</h3>
          </div>
          
          <div className="space-y-4">
            {buildResolutions.length === 0 ? (
              <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p>No habits defined yet.</p>
                  <Button variant="link" onClick={() => setIsAddOpen(true)} className="text-blue-600">
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            ) : (
              buildResolutions.map(res => (
                <ResolutionCard 
                  key={res._id} 
                  resolution={res} 
                  todayLog={logs?.find(l => l.resolutionId === res._id && l.date === today)}
                  streak={getStreak(res._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Break Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-900">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-lg text-red-900 dark:text-red-100">Avoid List (Zero Tolerance)</h3>
          </div>

          <div className="space-y-4">
            {breakResolutions.length === 0 ? (
              <Card className="border-dashed border-2 border-red-200 bg-red-50/50 dark:bg-red-900/10">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p>No vices to break?</p>
                  <Button variant="link" onClick={() => setIsAddOpen(true)} className="text-red-600">
                    Eliminate Weakness
                  </Button>
                </CardContent>
              </Card>
            ) : (
              breakResolutions.map(res => (
                <ResolutionCard 
                  key={res._id} 
                  resolution={res} 
                  todayLog={logs?.find(l => l.resolutionId === res._id && l.date === today)}
                  streak={getStreak(res._id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AddResolutionDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
