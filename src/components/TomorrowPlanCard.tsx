import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Moon, Target, Zap, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";

interface TomorrowPlanCardProps {
  dateStr: string;
  tomorrowPlan?: string;
  isToday: boolean;
}

export default function TomorrowPlanCard({ dateStr, tomorrowPlan, isToday }: TomorrowPlanCardProps) {
  const updateMetrics = useMutation(api.history.updateDailyMetrics);
  const [plan, setPlan] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const tomorrowDate = format(addDays(parseISO(dateStr), 1), "EEEE, MMMM do");
  const isPlanEmpty = !plan.trim();

  useEffect(() => {
    setPlan(tomorrowPlan || "");
    setIsSaved(!!tomorrowPlan);
  }, [tomorrowPlan, dateStr]);

  useEffect(() => {
    // Show warning if it's evening and no plan is set
    const hour = new Date().getHours();
    if (isToday && hour >= 18 && isPlanEmpty) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isToday, isPlanEmpty]);

  const handleSave = async () => {
    if (isPlanEmpty) {
      toast.error("You can't leave tomorrow unplanned!");
      return;
    }

    try {
      await updateMetrics({
        date: dateStr,
        tomorrowPlan: plan,
      });
      setIsSaved(true);
      toast.success("Tomorrow's battle plan locked in! 🎯");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save plan");
    }
  };

  return (
    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-red-50/20 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-red-950/10 shadow-2xl overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5 pointer-events-none" />
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <CardHeader className="pb-4 border-b-2 border-amber-500/20 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="bg-gradient-to-br from-amber-500 to-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                {isToday ? <Moon className="h-5 w-5" /> : <Sunrise className="h-5 w-5" />}
              </motion.div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-400 dark:via-orange-400 dark:to-red-400">
                {isToday ? "Tonight's Mission" : "Tomorrow's Plan"}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 pl-13">
              <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                Plan for {tomorrowDate}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isSaved && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-green-500/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-bold">LOCKED IN</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Psychological trigger warning */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-800 dark:text-red-200">
                  ⚠️ DANGER: No Plan = Wasted Tomorrow
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  Without a plan, you'll wake up directionless. Your morning—the most productive hours—will be wasted deciding what to do. <span className="font-bold">Plan now or lose tomorrow.</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="p-6 space-y-4 relative">
        {/* Psychological prompt */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              The Question That Changes Everything:
            </p>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed pl-6">
            "If I could only accomplish <span className="font-black underline">ONE THING</span> tomorrow that would make the day a massive win, what would it be?"
          </p>
        </div>

        {/* Plan input */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Your Battle Plan for Tomorrow
          </label>
          <Textarea
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Write your plan here... Be specific. What's the ONE thing that matters most?"
            className="min-h-[120px] text-base border-2 border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 bg-white/50 dark:bg-black/20 resize-none"
          />
          <p className="text-xs text-muted-foreground italic">
            💡 Tip: Keep it simple. One clear objective beats ten vague goals.
          </p>
        </div>

        {/* Save button with psychological trigger */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleSave}
            disabled={isPlanEmpty}
            className={`w-full h-12 text-base font-black shadow-xl transition-all ${
              isPlanEmpty
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 shadow-amber-500/50"
            }`}
          >
            {isPlanEmpty ? (
              "WRITE YOUR PLAN FIRST"
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                PLAN LOCKED IN
              </>
            ) : (
              <>
                <Target className="h-5 w-5 mr-2" />
                LOCK IN TOMORROW'S PLAN
              </>
            )}
          </Button>
        </motion.div>

        {/* Motivational footer */}
        <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-center text-muted-foreground font-medium leading-relaxed">
            <span className="font-bold text-amber-600 dark:text-amber-400">Winners plan tonight.</span> Losers figure it out in the morning. Which one are you?
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
