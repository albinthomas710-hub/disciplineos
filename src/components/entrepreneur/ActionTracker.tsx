import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Users, 
  Lightbulb, 
  TrendingUp,
  Target,
  Zap,
  Quote
} from "lucide-react";

export function ActionTracker() {
  const todayAction = useQuery((api as any).entrepreneurActions.getTodayAction);
  const weeklyStats = useQuery((api as any).entrepreneurActions.getWeeklyStats);
  const upsertAction = useMutation((api as any).entrepreneurActions.upsertTodayAction);

  const [builtSomething, setBuiltSomething] = useState(false);
  const [builtNote, setBuiltNote] = useState("");
  const [talkedToCustomers, setTalkedToCustomers] = useState(false);
  const [customersCount, setCustomersCount] = useState(0);
  const [learnedSkill, setLearnedSkill] = useState(false);
  const [skillLearned, setSkillLearned] = useState("");
  const [betterThanYesterday, setBetterThanYesterday] = useState(false);
  const [lessonLearned, setLessonLearned] = useState("");
  const [hoursWorked, setHoursWorked] = useState(0);
  const [action24hrs, setAction24hrs] = useState("");
  const [goal7days, setGoal7days] = useState("");
  const [goal30days, setGoal30days] = useState("");
  const [goal90days, setGoal90days] = useState("");

  useEffect(() => {
    if (todayAction) {
      setBuiltSomething(todayAction.builtSomething);
      setBuiltNote(todayAction.builtSomethingNote || "");
      setTalkedToCustomers(todayAction.talkedToCustomers);
      setCustomersCount(todayAction.customersCount || 0);
      setLearnedSkill(todayAction.learnedNewSkill);
      setSkillLearned(todayAction.skillLearned || "");
      setBetterThanYesterday(todayAction.betterThanYesterday);
      setLessonLearned(todayAction.lessonLearned || "");
      setHoursWorked(todayAction.hoursWorked || 0);
      setAction24hrs(todayAction.action24hrs || "");
      setGoal7days(todayAction.goal7days || "");
      setGoal30days(todayAction.goal30days || "");
      setGoal90days(todayAction.goal90days || "");
    }
  }, [todayAction]);

  const handleSave = async () => {
    try {
      await upsertAction({
        builtSomething,
        builtSomethingNote: builtNote || undefined,
        talkedToCustomers,
        customersCount: customersCount > 0 ? customersCount : undefined,
        learnedNewSkill: learnedSkill,
        skillLearned: skillLearned || undefined,
        betterThanYesterday,
        lessonLearned: lessonLearned || undefined,
        hoursWorked: hoursWorked > 0 ? hoursWorked : undefined,
        action24hrs: action24hrs || undefined,
        goal7days: goal7days || undefined,
        goal30days: goal30days || undefined,
        goal90days: goal90days || undefined,
      });
      toast.success("Action log saved! 🚀");
    } catch (error) {
      toast.error("Failed to save action log");
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Stats */}
      {weeklyStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border-2 border-blue-200 dark:border-blue-800"
          >
            <Clock className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{weeklyStats.totalHours}h</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border-2 border-green-200 dark:border-green-800"
          >
            <Zap className="h-6 w-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold">{weeklyStats.daysBuilt}/7</p>
            <p className="text-xs text-muted-foreground">Days Built</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border-2 border-purple-200 dark:border-purple-800"
          >
            <Users className="h-6 w-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{weeklyStats.totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Customers Talked</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-xl border-2 border-orange-200 dark:border-orange-800"
          >
            <Lightbulb className="h-6 w-6 text-orange-600 mb-2" />
            <p className="text-2xl font-bold">{weeklyStats.daysLearned}/7</p>
            <p className="text-xs text-muted-foreground">Days Learned</p>
          </motion.div>
        </div>
      )}

      {/* Core Questions */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Accountability
          </CardTitle>
          <p className="text-sm text-muted-foreground">Core questions to keep you on track</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Did I build something today? */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBuiltSomething(!builtSomething)}
                  className="cursor-pointer"
                >
                  {builtSomething ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <Label className="text-lg font-semibold cursor-pointer" onClick={() => setBuiltSomething(!builtSomething)}>
                  Did I build something today?
                </Label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground ml-9">
              💡 Build something every single day even if it's small
            </p>
            {builtSomething && (
              <Input
                placeholder="What did you build?"
                value={builtNote}
                onChange={(e) => setBuiltNote(e.target.value)}
                className="ml-9"
              />
            )}
          </div>

          {/* Did I talk to customers? */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTalkedToCustomers(!talkedToCustomers)}
                  className="cursor-pointer"
                >
                  {talkedToCustomers ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <Label className="text-lg font-semibold cursor-pointer" onClick={() => setTalkedToCustomers(!talkedToCustomers)}>
                  Did I talk to customers?
                </Label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground ml-9">
              💬 Talk to 5+ customers per week
            </p>
            {talkedToCustomers && (
              <Input
                type="number"
                placeholder="How many customers?"
                value={customersCount || ""}
                onChange={(e) => setCustomersCount(parseInt(e.target.value) || 0)}
                className="ml-9"
              />
            )}
          </div>

          {/* Did I learn a new skill? */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLearnedSkill(!learnedSkill)}
                className="cursor-pointer"
              >
                {learnedSkill ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <Label className="text-lg font-semibold cursor-pointer" onClick={() => setLearnedSkill(!learnedSkill)}>
                Did I learn a new skill?
              </Label>
            </div>
            {learnedSkill && (
              <Input
                placeholder="What skill did you learn?"
                value={skillLearned}
                onChange={(e) => setSkillLearned(e.target.value)}
                className="ml-9"
              />
            )}
          </div>

          {/* Am I better than yesterday? */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBetterThanYesterday(!betterThanYesterday)}
                className="cursor-pointer"
              >
                {betterThanYesterday ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <Label className="text-lg font-semibold cursor-pointer" onClick={() => setBetterThanYesterday(!betterThanYesterday)}>
                Am I better than yesterday?
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-9">
              📝 Document every lesson learned
            </p>
            {betterThanYesterday && (
              <Textarea
                placeholder="What lesson did you learn today?"
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
                className="ml-9"
                rows={2}
              />
            )}
          </div>

          {/* Hours worked */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Hours worked today</Label>
            <p className="text-sm text-muted-foreground">
              ⚡ Execute 80-100hrs per week for years
            </p>
            <Input
              type="number"
              placeholder="0"
              value={hoursWorked || ""}
              onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
              className="max-w-xs"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg text-center">
              <p className="font-bold text-lg">Build - Sell - Deliver - Repeat - Productize</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Action Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="font-semibold">Action in next 24 hours</Label>
            <Textarea
              placeholder="What will you do in the next 24 hours?"
              value={action24hrs}
              onChange={(e) => setAction24hrs(e.target.value)}
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="font-semibold">My 7 days goal</Label>
            <Textarea
              placeholder="What will you achieve this week?"
              value={goal7days}
              onChange={(e) => setGoal7days(e.target.value)}
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="font-semibold">My 30 days goal</Label>
            <Textarea
              placeholder="What will you achieve this month?"
              value={goal30days}
              onChange={(e) => setGoal30days(e.target.value)}
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="font-semibold">My 90 days goal</Label>
            <Textarea
              placeholder="What will you achieve in 90 days?"
              value={goal90days}
              onChange={(e) => setGoal90days(e.target.value)}
              rows={2}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Motivational Quotes */}
      <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Quote className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <p className="text-lg font-semibold italic">
              "You are the average of the 5 people you spend most time with"
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Quote className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <p className="text-lg font-semibold italic">
              "Your network is your networth"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        Save Today's Action Log
      </Button>
    </div>
  );
}
