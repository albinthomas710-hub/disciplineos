import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Target, Zap, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface DailyMetricsCardProps {
  dateStr: string;
  initialMetrics?: {
    focusScore?: number;
    outputLog?: string;
    dailyRating?: number;
  } | null;
  hoursInvested: number;
}

export default function DailyMetricsCard({ dateStr, initialMetrics, hoursInvested }: DailyMetricsCardProps) {
  const updateMetrics = useMutation(api.history.updateDailyMetrics);
  
  const [focusScore, setFocusScore] = useState(5);
  const [outputLog, setOutputLog] = useState("");
  const [dailyRating, setDailyRating] = useState(50);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialMetrics) {
      setFocusScore(initialMetrics.focusScore || 5);
      setOutputLog(initialMetrics.outputLog || "");
      setDailyRating(initialMetrics.dailyRating || 50);
    } else {
      setFocusScore(5);
      setOutputLog("");
      setDailyRating(50);
    }
    setIsDirty(false);
  }, [initialMetrics, dateStr]);

  const handleSave = async () => {
    try {
      await updateMetrics({
        date: dateStr,
        focusScore,
        outputLog,
        dailyRating,
      });
      toast.success("Daily verdict saved");
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to save metrics");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-amber-500";
    if (rating >= 80) return "text-green-500";
    if (rating >= 60) return "text-blue-500";
    if (rating >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 90) return "Elite Day";
    if (rating >= 80) return "Efficient Day";
    if (rating >= 60) return "Solid Day";
    if (rating >= 40) return "Mediocre";
    return "Weak Day";
  };

  return (
    <Card className="border-2 border-muted/50 overflow-hidden">
      <CardHeader className="bg-muted/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Daily Verdict
          </CardTitle>
          {isDirty && (
            <Button size="sm" onClick={handleSave} className="h-8">
              <Save className="h-4 w-4 mr-2" />
              Save Verdict
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex flex-col items-center justify-center text-center">
            <Clock className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-2xl font-bold">{hoursInvested}h</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Quantity</span>
          </div>
          
          <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex flex-col items-center justify-center text-center">
            <Zap className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-2xl font-bold">{focusScore}/10</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Quality</span>
          </div>

          <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex flex-col items-center justify-center text-center">
            <Target className="h-5 w-5 text-green-500 mb-1" />
            <span className={`text-2xl font-bold ${getRatingColor(dailyRating)}`}>{dailyRating}%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Verdict</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          {/* Focus Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Focus Level (Quality)
              </label>
              <span className="font-mono font-bold text-lg">{focusScore}/10</span>
            </div>
            <Slider
              value={[focusScore]}
              min={1}
              max={10}
              step={1}
              onValueChange={(vals) => {
                setFocusScore(vals[0]);
                setIsDirty(true);
              }}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
              <span>Distracted</span>
              <span>Deep Work</span>
            </div>
          </div>

          {/* Output Log */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Output Log (Results)
            </label>
            <Textarea
              placeholder="What did you actually ship? (e.g. 3 videos, 5 leads, 1 offer)"
              value={outputLog}
              onChange={(e) => {
                setOutputLog(e.target.value);
                setIsDirty(true);
              }}
              className="min-h-[80px] text-sm resize-none bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Be honest. Output dominates everything.
            </p>
          </div>

          {/* Rating Slider */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Final Rating (Verdict)
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getRatingColor(dailyRating)} border-current`}>
                  {getRatingLabel(dailyRating)}
                </Badge>
                <span className={`font-mono font-bold text-lg ${getRatingColor(dailyRating)}`}>
                  {dailyRating}%
                </span>
              </div>
            </div>
            <Slider
              value={[dailyRating]}
              min={0}
              max={100}
              step={5}
              onValueChange={(vals) => {
                setDailyRating(vals[0]);
                setIsDirty(true);
              }}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
              <span>Wasted Day</span>
              <span>Legendary</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
