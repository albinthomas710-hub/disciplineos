import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  AlertTriangle,
  Target,
} from "lucide-react";
import { toast } from "sonner";

export default function FutureTimelineView() {
  const data = useQuery(api.futureTimelineQueries.getTimeline);
  const resetTimeline = useMutation(api.futureTimelineQueries.resetTimeline);

  const handleReset = async () => {
    try {
      await resetTimeline();
      toast.success("Timeline reset to neutral state");
    } catch (error) {
      toast.error("Failed to reset timeline");
    }
  };

  if (!data) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const { timeline, manifestations, currentStreak, todayCompletionRate, userName } = data;
  const timelineAVibrancy = timeline?.timelineAVibrancy || 50;
  const timelineBVibrancy = timeline?.timelineBVibrancy || 50;

  // Generate personalized timeline entries based on user data
  const goals = manifestations.map(m => m.title).join(", ") || "your goals";
  
  const timelineAEntry = `Day 90 - ${userName}'s Journal

I can't believe how far I've come. ${currentStreak > 0 ? `That ${currentStreak}-day streak was just the beginning.` : "Starting was hard, but I pushed through."} Now I'm at 90 days of consistency.

${manifestations.length > 0 ? `My goals - ${goals} - they're not just dreams anymore. I'm making real progress every single day.` : "I've built habits that actually stick. Every day I show up for myself."}

The person I was 90 days ago would be proud. I wake up with purpose now. My ${todayCompletionRate}% completion rate back then taught me that small wins compound into massive change.

This is just the beginning. I'm becoming the person I always knew I could be.`;

  const timelineBEntry = `Day 90 - ${userName}'s Journal

Another day wasted. I had ${currentStreak > 0 ? `a ${currentStreak}-day streak going` : "so many chances"}, but I let it slip away.

${manifestations.length > 0 ? `Those goals I set - ${goals} - they're still just ideas. I keep telling myself "tomorrow," but tomorrow never comes.` : "I keep making plans but never following through. It's exhausting."}

I'm stuck in the same patterns. ${todayCompletionRate}% completion felt achievable back then, but I gave up when it got hard. Now I'm right back where I started - or worse.

I know I'm capable of more. But knowing isn't enough. I needed to act, and I didn't.`;

  const futureLetterA = `Dear Past ${userName},

Thank you. Thank you for showing up when it was hard. Thank you for choosing discipline over comfort.

That decision you're about to make - to complete that time block, to stay consistent - it matters more than you know. Every small choice compounds.

90 days from now, you'll look back at this moment and realize: this was when everything changed.

Keep going. Your future self is counting on you.

With gratitude,
Future ${userName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Future Self Mirror
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Two possible futures based on your choices today
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Every choice you make shifts the balance between these two timelines. 
              Complete your time blocks to make Timeline A more vivid. Miss them, and Timeline B grows stronger.
            </p>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Neutral
            </Button>

            {/* Vibrancy Indicators */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Discipline Path</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${timelineAVibrancy}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{timelineAVibrancy}% vivid</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Drift Path</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${timelineBVibrancy}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{timelineBVibrancy}% vivid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Letter from Future Self */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-600" />
              Letter from Your Future Disciplined Self
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap italic">
              {futureLetterA}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline A - Discipline Path */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="border-2 border-green-200 dark:border-green-800 h-full"
            style={{ 
              opacity: 0.5 + (timelineAVibrancy / 100) * 0.5,
              filter: `brightness(${0.8 + (timelineAVibrancy / 100) * 0.4})`
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                    Timeline A: Discipline Path
                  </h3>
                  <p className="text-xs text-muted-foreground font-normal">
                    90 days from now if you stay consistent
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {timelineAEntry}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-green-700 dark:text-green-400 font-semibold">
                    This future gets brighter every time you complete a time block ✨
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline B - Drift Path */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="border-2 border-red-200 dark:border-red-800 h-full"
            style={{ 
              opacity: 0.5 + (timelineBVibrancy / 100) * 0.5,
              filter: `brightness(${0.8 + (timelineBVibrancy / 100) * 0.4})`
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                    Timeline B: Drift Path
                  </h3>
                  <p className="text-xs text-muted-foreground font-normal">
                    90 days from now if you give up
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {timelineBEntry}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                    This future fades every time you complete a time block 🌑
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}