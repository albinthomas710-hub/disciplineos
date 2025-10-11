import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, Heart, Phone, BookOpen, Users, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EmergencyDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const temptationStrategies = [
  {
    icon: Heart,
    title: "Deep Breathing",
    description: "Take 10 deep breaths, focusing on each inhale and exhale",
    action: "Start Breathing Exercise",
  },
  {
    icon: Phone,
    title: "Call Someone",
    description: "Reach out to your accountability partner or a trusted friend",
    action: "Open Contacts",
  },
  {
    icon: BookOpen,
    title: "Read Your Goals",
    description: "Review your vision and why you started this journey",
    action: "View Goals",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with others who understand your struggle",
    action: "Join Community",
  },
];

const temptationTriggers = [
  {
    id: 1,
    title: "YouTube Shorts After Learning",
    description: "Watching useful AI/educational videos → triggered by YT Shorts thumbnails → scrolling for hours",
    color: "from-red-500 to-orange-500",
  },
  {
    id: 2,
    title: "Funk Music Fantasy Loop",
    description: "Listening to funk music → imagining success → experiencing fantasy for hours instead of executing",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Kitchen Idle Time",
    description: "Wasting 30-40 mins waiting for food or overeating instead of productive waiting",
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: 4,
    title: "Instagram Reels + Funk Music",
    description: "Funk music trigger → watching reels and scrolling for hours → thinking about rich life",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 5,
    title: "School Thoughts (AVOID)",
    description: "Thinking about school/friends mocking/ego → useless thoughts that won't happen anyway",
    color: "from-gray-500 to-slate-500",
    critical: true,
  },
];

export default function EmergencyDashboard({
  open,
  onOpenChange,
}: EmergencyDashboardProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<number | null>(null);

  const handleStrategyClick = (strategy: string) => {
    toast.success(`${strategy} activated - Stay strong! 💪`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black text-white border-red-500/30">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
            >
              <AlertCircle className="h-10 w-10 text-white" />
            </motion.div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            You're Not Alone
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 text-lg">
            You took the right step. Now choose a strategy to help you through this moment.
          </DialogDescription>
        </DialogHeader>

        {/* Support Strategies Grid */}
        <div className="grid md:grid-cols-2 gap-4 my-6">
          {temptationStrategies.map((strategy, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <strategy.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">
                        {strategy.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        {strategy.description}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleStrategyClick(strategy.action)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                      >
                        {strategy.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Your Specific Triggers */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-center">
            Your Temptation Triggers
          </h3>
          <p className="text-sm text-gray-400 text-center mb-6">
            Identify which trigger you're facing right now
          </p>
          <div className="space-y-3">
            {temptationTriggers.map((trigger) => (
              <motion.div
                key={trigger.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: trigger.id * 0.1 }}
                onClick={() => setSelectedTrigger(trigger.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTrigger === trigger.id
                    ? "border-cyan-500 bg-cyan-500/10"
                    : trigger.critical
                    ? "border-red-500/50 bg-red-500/5 hover:border-red-500"
                    : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trigger.color} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white font-bold">{trigger.id}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">
                        {trigger.title}
                      </h4>
                      {trigger.critical && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          CRITICAL
                        </span>
                      )}
                      {selectedTrigger === trigger.id && (
                        <CheckCircle className="h-5 w-5 text-cyan-500 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {trigger.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Encouragement Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-6 rounded-lg bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30"
        >
          <p className="text-center text-gray-300 italic">
            "No temptation has overtaken you except what is common to mankind. Stay strong - you've got this."
          </p>
        </motion.div>

        {/* Stay Strong Button */}
        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            onClick={() => {
              toast.success("Stay strong! You've got this. 💪");
              onOpenChange(false);
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg cursor-pointer"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Stay strong! You've got this.
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
